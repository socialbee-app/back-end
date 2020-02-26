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
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("posts")
    .add(newPost)
    .then(doc => {
      const postRes = newPost;
      postRes.postId = doc.id;
      res.json(postRes);
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
    return res.status(400).json({ comment: "Must not be empty" });
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
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
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

// Like a post
exports.likePost = (req, res) => {
  // get matching like and post document
  // check if the post exists
  // check if the post has been liked already
  // if not, add like data and increment like count in db and response

  const likeDoc = db
    .collection("likes")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDoc = db.doc(`/posts/${req.params.postId}`);

  let postData = {};

  postDoc
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDoc.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            postId: req.params.postId,
            username: req.user.username
          })
          .then(() => {
            postData.likeCount++;
            return postDoc.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return res.status(400).json({ error: "Post already liked" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.code });
    });
};

// Unlike a post
exports.unlikePost = (req, res) => {
  const likeDoc = db
    .collection("likes")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDoc = db.doc(`/posts/${req.params.postId}`);

  let postData = {};

  postDoc
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDoc.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then(data => {
      if (!data.empty) {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.likeCount--;
            return postDoc
              .update({ likeCount: postData.likeCount })
              .then(() => {
                return res.json(postData);
              });
          });
      } else {
        return res.status(400).json({ error: "Post not liked" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.code });
    });
};

// Delete a post
exports.deletePost = (req, res) => {
  const postDoc = db.doc(`/posts/${req.params.postId}`);

  postDoc
    .get()
    .then(doc => {
      if (doc.exists) {
        if (doc.data().username !== req.user.username) {
          return res.status(403).json({ error: "Unauthorized" });
        }
        return postDoc.delete();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then(() => {
      res.json({ message: "Post deleted" });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
};
