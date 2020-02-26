const isEmpty = string => {
  // remove white space and check if empty string
  if (string.trim() === "") return true;
  else return false;
};

const validEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // validates for correct email format

  if (email.match(regEx)) return true;
  else return false;
};

exports.validateSignup = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!validEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (isEmpty(data.password)) errors.password = "Password is required";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(data.username)) errors.username = "Username is required";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLogin = data => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Email is required";
  if (isEmpty(data.password)) errors.password = "Password is required";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.reduceUserInfo = data => {
  let userInfo = {};

  if (!isEmpty(data.bio.trim())) userInfo.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== "http") {
      userInfo.website = `http://${data.website.trim()}`;
    } else {
      userInfo.website = data.website;
    }
  }
  if (!isEmpty(data.location.trim())) userInfo.location = data.location;
};
