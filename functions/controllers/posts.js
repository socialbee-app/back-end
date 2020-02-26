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
