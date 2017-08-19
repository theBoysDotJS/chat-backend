module.exports = (req, res, next) => {
  console.log("inside onlyLoggedIn", req.user)
  //next();
  if (req.user) {
    console.log("passed")
    next();
  } else {
    res
    .status(401)
    .json({
      'error' : "ERROR",
      'message' : 'You are unauthorized to complete this action'
    });
  }
};
