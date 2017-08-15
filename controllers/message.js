const express = require('express');

module.exports = (queryAPI) => {
  const messageController = express.Router();


  // create a new message
  messageController.post('/message', (req, res) => {
    console.log(req.body, 'createing a new message...')
    // queryAPI.
  })
  // edit a message
  messageController.put('/message/:id', (req, res) => {

  })
  // delete a message
  messageController.delete('/message/:id', (req, res) => {

  })




  return messageController;
};
