const express = require('express');


const onlyLoggedIn = require('../lib/only-logged-in');


module.exports = (queryAPI) => {
  const conversationController = express.Router();


  conversationController.post('/create', onlyLoggedIn, (req, res) => {
    console.log(req.body, "we are in the conversation controller.. ")
    queryAPI.createNewConversation({
        name: req.body.name,
        admin: req.user.user_id
    })
	.then(result => {
		queryAPI.joinConversationAllUsers(result.id, req.user.user_id)
		return result;
	})
    .then(result => res.status(201).json(result))
    .catch(err => res.status(400).json({
    'error' : "ERROR",
    'message' : 'Failed to create a conversation',
    'err_message' :  err.message
  }))
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
      .catch(err => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to update the conversation',
      'err_message' :  err.message
    }));
    })

  // delete a conversation
  conversationController.delete('/:id', onlyLoggedIn, (req, res) => {
        console.log("deleting a conversation... ")
        queryAPI.deleteConversation(req.params.id)
        .then(data => res.status(201).json(data))
        .catch(err => res.status(400).json({
        'error' : "ERROR",
        'message' : 'Failed to delete a conversation',
        'err_message' :  err.message
      }));
  })



  // get a single conversation
  conversationController.get('/:id', (req, res) => {
      var conversationObj = {
        messages : [],
        users: []
      };
      queryAPI.getSingleConversation(req.params.id)
      .then(conversation => {

         //   conversationObj = {...conversation[0]};
		  console.log(conversation[0])
          conversationObj = conversation[0];
          return (queryAPI.getSingleConversationUser(req.params.id))
        })
        .then(users => {
          conversationObj['users'] = users;
          return(queryAPI.getSingleConversationMessages(req.params.id))
        })
        .then(messages => {
          conversationObj['messages'] = messages;
          res.status(201).json(conversationObj)
        })
      .catch(err => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to get single conversation',
      'err_message' :  err.message
    }));
  })


  // get a ALL conversations
  conversationController.get('/', onlyLoggedIn, (req, res) => {
      console.log(req.user.user_id, 'this is the user')

      var conversationArray = [];

      queryAPI.getAllConversations(req.user.user_id)
      .then(conversations => {
          var stuff = [];
          conversations.forEach(convo => {
            conversationArray.push(convo);
            stuff.push(queryAPI.getSingleConversationUser(convo.id))
          })
          return Promise.all(stuff)
        })
        .then(users=>{
          conversationArray.map((convo, index) => {
            convo['users'] = users[index];
            return convo;
          })

          var stuff = [];
          conversationArray.forEach(convo => {
            stuff.push(queryAPI.getSingleConversationMessages(convo.id, 2))
          })
          return Promise.all(stuff)

        })
        .then(messages=> {
          conversationArray.map((convo, index) => {
            convo['messages'] = messages[index];
            return convo;
          })

          console.log(conversationArray, "aaaaaaa");
          res.status(201).json(conversationArray);

        })

      .catch(err => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to get all conversations',
      'err_message' :  err.message
    }));
  })

  // add a user/ join a conversation
  conversationController.post('/:id/join', onlyLoggedIn, (req, res) => {
      queryAPI.joinConversationAllUsers(
          req.params.id,
          req.body.user
      )
      .then(success => res.status(201).json(success))
      .catch(err => res.status(400).json({
      'error' : "ERROR",
      'message' : 'Failed to add user/join conversation',
      'err_message' :  err.message
    }));
  })

  // remove a user from a conversation
  conversationController.put('/:id/leave', onlyLoggedIn, (req, res) => {
    queryAPI.removeAllUserFromConversation(
        req.params.id,
        req.body.users
    )
    .then(success => res.status(201).json(success))
    .catch(err => res.status(400).json({
    'error' : "ERROR",
    'message' : 'Failed to add remove/leave from conversation',
    'err_message' :  err.message
  }));
  })


  return conversationController;
};
