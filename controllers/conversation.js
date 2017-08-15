const express = require('express');

module.exports = (queryAPI) => {
  const conversationController = express.Router();

  // new conversation
  conversationController.post('conversation/:id', (req, res) => {

  })
  // update a conversation
  conversationController.put('conversation/:id', (req, res) => {

  })

  // delete a conversation
  conversationController.delete('/conversation/:id', (req, res) => {

  })

  // get all conversations
  conversationController.get('/conversation', (req, res) => {

  })

  // get a single conversations
  conversationController.get('/conversation/:id', (req, res) => {

  })

  // add a user/ join a conversation
  conversationController.get('/conversation/:id', (req, res) => {

  })

  // remove a user from a conversation
  conversationController.patch('', (req, res) => {

  })

  return conversationController;
};
