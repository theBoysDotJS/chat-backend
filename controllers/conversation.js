const express = require('express');

module.exports = (queryAPI) => {
  const conversationController = express.Router();

  // new conversation
  conversationController.post('/:id', (req, res) => {

  })
  // update a conversation
  conversationController.put('/:id', (req, res) => {

  })

  // delete a conversation
  conversationController.delete('/:id', (req, res) => {

  })

  // get all conversations
  conversationController.get('/', (req, res) => {
    res.send("hello")
  })

  // get a single conversations
  conversationController.get('/:id', (req, res) => {

  })

  // add a user/ join a conversation
  conversationController.get('/:id', (req, res) => {

  })

  // remove a user from a conversation
  conversationController.patch('/:id', (req, res) => {

  })

  return conversationController;
};
