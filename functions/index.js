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
  // on like, send a notification to the post's owner
  .document("/likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snapshot.data().username) {
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
      .catch(err => console.log(err));
  });

exports.deleteLikeNotification = functions.firestore
  // Delete sent like notification when unliked
  .document("/likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => console.log(err));
  });

exports.createCommentNotification = functions.firestore
  .document("/comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snapshot.data().username) {
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
      .catch(err => console.log(err));
  });

exports.userImageUpdate = functions.firestore
  // when a user changes their profile image update everywhere they've used it
  // for example, old posts

  .document("/users/{userId}")
  .onUpdate(change => {
    // console.log("change.before.data", change.before.data());
    // console.log("change.after.data", change.after.data());

    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      let batch = db.batch();
      return db
        .collection("posts")
        .where("username", "==", change.before.data().username)
        .get()
        .then(data => {
          data.forEach(doc => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.postDeletedCleanup = functions.firestore
  // When deleting a post, delete all comments, likes, and notifications attached to it.
  .document("/posts/{postId}")
  .onDelete((snapshot, context) => {
    const postId = context.params.postId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("postId", "==", postId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("postId", "==", postId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("postId", "==", postId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.log(err));
  });
