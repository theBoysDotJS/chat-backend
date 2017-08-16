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
<<<<<<< HEAD
    res.send("hello")
=======

>>>>>>> sockets
  })

  // get a single conversations
  conversationController.get('/:id', (req, res) => {

  })

  // add a user/ join a conversation
  conversationController.get('/:id', (req, res) => {

  })

  // remove a user from a conversation
<<<<<<< HEAD
  conversationController.patch('/:id', (req, res) => {
=======
  conversationController.put('/:id', (req, res) => {
>>>>>>> sockets

  })

  return conversationController;
};
<<<<<<< HEAD
=======

// INSERT INTO conversation ( name, admin )
//   VALUES
//      ( 'Zs chatroom', '9');
>>>>>>> sockets
