const express = require('express');

const onlyLoggedIn = require('../lib/only-logged-in');

module.exports = (queryAPI) => {
  const messageController = express.Router();


  // create a new message
  messageController.post('/create', onlyLoggedIn, (req, res) => {
    queryAPI.createMessage({
        author: req.body.author,
        message_body: req.body.message_body,
        type: req.body.type,
        conversation_id : req.body.conversation_id
      })
      .then(message => res.status(201).json(message))
      .catch(err => res.status(400).json(err.message))
  })
  
  // edit a message
  messageController.put('/:id', onlyLoggedIn, (req, res) => {
    console.log("about to run put function");
    console.log(req.body)
    queryAPI.messageBelongsToUser(req.params.id, req.user.user_id)
    .then((result) => {
      queryAPI.editMessage(req.params.id, {
        message_body: req.body.message_body
      })
    })
    .then(message => {
      console.log("message successfully edited")
      res.status(201).json(message)
    })
    .catch(err => res.status(400).json(err))
  })


  // delete a message, add onlyLoggedIn middleware
  messageController.delete('/:id', onlyLoggedIn, (req, res) => {
    console.log("about to run the delete function for message")
    queryAPI.messageBelongsToUser(req.params.id, req.user.user_id)
    .then((result) => {
      console.log("line 40, passed", result)
      return queryAPI.deleteMessage(req.params.id)
    })
    .then((result) => {
      console.log("successfully deleted")
      res.status(204).end()
    })
    .catch(err => {
      console.log(err.message, "the error message")
      res.status(400).send(err.message)});
  });
  return messageController;
};
