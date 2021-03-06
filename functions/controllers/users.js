const { db, admin } = require("../util/admin");

const firebaseConfig = require("../util/firebaseConfig");

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const {
  validateSignup,
  validateLogin,
  reduceUserInfo
} = require("../util/middleware/dataValidation");

// Sign up users
exports.signup = (req, res) => {
  const newUser = {
    ...req.body
  };

  const { valid, errors } = validateSignup(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  let token, userId;

  db.doc(`/users/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(Idtoken => {
      token = Idtoken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
        userId
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

// Login users in
exports.login = (req, res) => {
  const user = {
    ...req.body
  };

  const { valid, errors } = validateLogin(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(IdToken => {
      return res.status(200).json({ token: IdToken });
    })
    .catch(err => {
      console.log(err);
      return res.status(403).json({ general: "Incorrect password" });
    });
};

// Add user info
exports.addUserInfo = (req, res) => {
  let userInfo = reduceUserInfo(req.body);

  db.doc(`/users/${req.user.username}`)
    .update(userInfo)
    .then(() => {
      return res.json({ message: "User info successfully updated" });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
};

// get any user's info
exports.getUserInfo = (req, res) => {
  let userInfo = {};

  db.doc(`/users/${req.params.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userInfo.user = doc.data();
        return db
          .collection("posts")
          .where("username", "==", req.params.username)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then(data => {
      userInfo.posts = [];
      data.forEach(doc => {
        userInfo.posts.push({
          ...doc.data(),
          userId: doc.id
        });
      });
      return res.json(userInfo);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  // gets the current user credentials, likes, and notification data
  let userData = {};

  db.doc(`/users/${req.user.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("username", "==", req.user.username)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.username)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {
        userData.notifications.push({
          ...doc.data(),
          notificationId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
};

// Upload profile image for user
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let uploadedImage = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "invalid file type" });
    }
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    imageFileName = `${Math.round(
      Math.random() * 10000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    uploadedImage = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket(`${firebaseConfig.storageBucket}`)
      .upload(uploadedImage.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: uploadedImage.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.username}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "Image successfully uploaded" });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};

exports.readNotifications = (req, res) => {
  // updates all viewed notifications to reflect being read

  let batch = db.batch();
  req.body.forEach(notificationId => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: "notifications marked as read" });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.code });
    });
};
