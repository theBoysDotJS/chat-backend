const express = require('express');


const onlyLoggedIn = require('../lib/only-logged-in');


module.exports = (queryAPI) => {
  const conversationController = express.Router();

 
  conversationController.post('/create', onlyLoggedIn, (req, res) => {
    console.log("we are in the conversation controller.. ")
    queryAPI.createNewConversation({
        name: req.body.name,
        admin: req.body.admin
    })
    .then(result => res.status(201).json(result))
    .catch(err => res.status(400).json(err.message));
  })

  // update a conversation
    conversationController.put('/:id', onlyLoggedIn, (req, res) => {
      queryAPI.updateConversation(
          req.params.id,
          {
              name: req.body.name,
              admin: req.body.admin
          })
      .then(conversation => res.status(201).json(conversation))
      .catch(err => res.status(400).json(err));
    })

  // delete a conversation
  conversationController.delete('/:id', onlyLoggedIn, (req, res) => {
        console.log("deleting a conversation... ")
        queryAPI.deleteConversation(req.params.id)
        .then(data => res.status(201).json(data))
        .catch(err => res.status(400).json(err));
  })



  // get a single conversation
  conversationController.get('/:id', (req, res) => {
      var conversationObj = {
        messages : [],
        users: []
      };
      queryAPI.getSingleConversation(req.params.id)
      .then(conversation => {
          conversationObj = conversation[0];
          queryAPI.getSingleConversationUser(req.params.id)
          .then(users=> {
              conversationObj['users'] = users;
              queryAPI.getSingleConversationMessages(req.params.id)
              .then(messages=>{
                  conversationObj['messages'] = messages;
                  res.status(201).json(conversationObj)
              })
          })
      })
      .catch(err => res.status(400).json(err));
  })


  // add a user/ join a conversation
  conversationController.post('/:id/join', onlyLoggedIn, (req, res) => {
      queryAPI.joinConversationAllUsers(
          req.params.id,
          req.body.users
      )
      .then(success => res.status(201).json(success))
      .catch(err => res.status(400).json(err.message));
  })

  // remove a user from a conversation
  conversationController.put('/:id/leave', (req, res) => {
    queryAPI.removeAllUserFromConversation(
        req.params.id,
        req.body.users
    )
    .then(success => res.status(201).json(success))
    .catch(err => res.status(400).json(false));
  })


  return conversationController;
};

