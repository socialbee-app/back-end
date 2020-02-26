const functions = require("firebase-functions");
const app = require("express")();
const { isAuthenticated } = require("./util/middleware/isAuthenticated");

const { db } = require("./util/admin");

const {
  getAllPosts,
  addPost,
  getPost,
  addPostComment,
  likePost,
  unlikePost,
  deletePost
} = require("./controllers/posts");

const {
  signup,
  login,
  uploadImage,
  addUserInfo,
  getAuthenticatedUser,
  getUserInfo,
  readNotifications
} = require("./controllers/users");

// Post Routes
app.get("/posts", getAllPosts);
app.post("/post", isAuthenticated, addPost);
app.get("/post/:postId", getPost);
app.delete("/post/:postId", isAuthenticated, deletePost);
app.get("/post/:postId/like", isAuthenticated, likePost);
app.get("/post/:postId/unlike", isAuthenticated, unlikePost);
app.post("/post/:postId/comment", isAuthenticated, addPostComment);

// Users Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", isAuthenticated, uploadImage);
app.post("/user", isAuthenticated, addUserInfo);
app.get("/user", isAuthenticated, getAuthenticatedUser);
app.get("/user/:username", getUserInfo);
app.post("/notifications", readNotifications);

exports.api = functions.https.onRequest(app);

exports.createLikeNotification = functions.firestore
  .document("/likes/{id}")
  .onCreate(snapshot => {
    db.doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().username,
            sender: snapshot.data().username,
            read: "false",
            postId: doc.id,
            type: "like",
            createdAt: new Date().toISOString()
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.log(err);
        return;
      });
  });

exports.deleteLikeNotification = functions.firestore
  .document("/likes/{id}")
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.log(err);
        return;
      });
  });

exports.createCommentNotification = functions.firestore
  .document("/comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().username,
            sender: snapshot.data().username,
            read: "false",
            postId: doc.id,
            type: "comment",
            createdAt: new Date().toISOString()
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.log(err);
        return;
      });
  });
