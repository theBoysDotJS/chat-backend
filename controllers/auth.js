const express = require('express');

const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (queryAPI) => {
  const authController = express.Router();

  // Create a new user (signup)
  authController.post('/user', (req, res) => {
    queryAPI.createUser({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      firstName : req.body.firstName,
	  lastName : req.body.lastName,
      language : req.body.language,
      avatarUrl : req.body.avatarUrl

    })
    .then(user => res.status(201).json(user))
    .catch(err => res.status(400).json(err.message));
  });

  // Create a new session (login)
  authController.post('/session', (req, res) => {
	  console.log(req.body, 'this is in sessions')
		queryAPI.createTokenFromCredentials(
	      req.body.username,
	      req.body.password
	    )
	    .then(resp => {
			res.status(201).json({ token: resp.token, user: resp.id })
		})
	    .catch(err => res.status(401).json(err));
  });


  // Delete a session (logout)
  authController.delete('/session', onlyLoggedIn, (req, res) => {
	console.log(req.sessionToken, req.body, 'tokens in delete');
    if (req.sessionToken === req.body.token) {
      queryAPI.deleteToken(req.body.token)

      .then(() => res.status(204).end())
      .catch(err => res.status(400).json(err.message));
  });

  // Retrieve current user
  authController.get('/me', onlyLoggedIn, (req, res) => {
	    queryAPI.returnFullUserObject(req.user.user_id)
		  .then((result) => res.status(201).json(result))
      .catch((err) => res.status(400).json(err.message))
  });

  return authController;
};
