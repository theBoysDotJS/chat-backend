const express = require('express');

const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (queryAPI) => {
  const messageController = express.Router();


  // create a new message
  messageController.post('/create', (req, res) => {

    //return queryAPI.createMessage()
  })
  // edit a message
  messageController.put('/:id', (req, res) => {

  })
  // delete a message
  messageController.delete('/:id', (req, res) => {

  })




  return messageController;
};
