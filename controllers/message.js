const express = require('express');

module.exports = (queryAPI) => {
  const messageController = express.Router();


  // create a new message
  messageController.post(``, (req, res) => {
    console.log(req.body, 'createing a new message...')
    // queryAPI.
  })
  // edit a message

  // delete a message


  return messageController;
};
