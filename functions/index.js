const functions = require("firebase-functions");

const app = require("express")();

const { isAuthenticated } = require("./util/middleware/isAuthenticated");

const { getAllPosts, addPost } = require("./controllers/posts");
const {
  signup,
  login,
  uploadImage,
  addUserInfo,
  getAuthenticatedUser
} = require("./controllers/users");

// Post Routes
app.get("/posts", getAllPosts);
app.post("/post", isAuthenticated, addPost);

// Users Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", isAuthenticated, uploadImage);
app.post("/user", isAuthenticated, addUserInfo);
app.get("/user", isAuthenticated, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
