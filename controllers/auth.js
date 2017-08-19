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
    .catch((err) => {
      // console.log();

      res.status(400).json({
      'error' : "ERROR",
      'message' : 'Signup Failed',
      'err_message' :  err.message
    })
  }
  )
  });

  // Create a new session (login)
  authController.post('/session', (req, res) => {
	  console.log(req.body)
		queryAPI.createTokenFromCredentials(
	      req.body.email,
	      req.body.password
	    )
	    .then(token => {
			res.status(201).json({ token: token })
		})
	    .catch(err => res.status(401).json({
      'error' : "ERROR",
      'message' : 'Login Failed',
      'err_message' :  err.message
    }));
  });


  // Delete a session (logout)
  authController.delete('/session', onlyLoggedIn, (req, res) => {
      queryAPI.deleteToken(req.sessionToken)
      .then(() => res.status(204).end())
      .catch(err => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to delete a session',
      'err_message' :  err.message
    }));
  });

  // Retrieve current user
  authController.get('/me', onlyLoggedIn, (req, res) => {
	    queryAPI.returnFullUserObject(req.user.user_id)
		  .then((result) => res.status(201).json(result))
      .catch((err) => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to return current user',
      'err_message' :  err.message
    }))
  });

  return authController;
};
