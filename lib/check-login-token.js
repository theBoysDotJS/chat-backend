module.exports = dataLoader => (req, res, next) => {
  console.log(req.headers.authorization, 'auth headers')
  if (req.headers.authorization) {
    // const token = req.headers.authorization.split(' ')[1];
    const token = req.headers.authorization
	console.log(token, 'the split token')
    dataLoader.getUserFromSession(token)
    .then(
      (user) => {
        console.log(user, token, "check login token")
        if (user) {
          req.user = user;
          req.sessionToken = token;
        }
        next();
      }
    )
    .catch(
      (err) => {
        console.error('Something went wrong while checking Authorization header', err.stack);
        next();
      }
    );
  } else {
    next();
  }
};
