const { db } = require("../util/admin");

exports.getAllPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          ...doc.data()
        });
      });
      return res.json(posts);
    })
    .catch(err => console.log(err));
};

exports.addPost = (req, res) => {
  const newPost = {
    body: req.body.body,
    username: req.user.username,
    createdAt: new Date().toISOString()
  };

  db.collection("posts")
    .add(newPost)
    .then(doc => {
      res.json({ message: `document ${doc.id} successfully created` });
    })
    .catch(err => {
      res.status(500).json({ error: "error adding post" });
      console.log(err);
    });
};

// Fetch a post
exports.getPost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }

      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then(data => {
      postData.comments = [];
      data.forEach(doc => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
};

// Comment on a post
exports.addPostComment = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({ error: "Must not be empty" });
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    username: req.user.username,
    userImage: req.user.imageUrl
  };

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
