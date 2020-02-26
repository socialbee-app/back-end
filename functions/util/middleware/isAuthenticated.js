const { admin, db } = require("../admin");

exports.isAuthenticated = (req, res, next) => {
  // Check if user has a token

  let IdToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    IdToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.log("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  // Then check if the token is valid
  // Add username to req obj, then next()

  admin
    .auth()
    .verifyIdToken(IdToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch(err => {
      console.log("Error while verifying token", err);
      return res.status(403).json(err);
    });
};
