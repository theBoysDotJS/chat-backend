const express = require('express');

module.exports = (queryAPI) => {
  const conversationController = express.Router();

  // new conversation
  conversationController.post('/', (req, res) => {
  
    queryAPI.createNewConversation({  
        name: req.body.name,
        admin: req.body.admin
    })
    .then(conversation => res.status(201).json(conversation))
    .catch(err => res.status(400).json(err));
  })

  // update a conversation
  conversationController.put('/:id', (req, res) => {    
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
    conversationController.delete('/:id', (req, res) => {
        queryAPI.deleteConversation(req.params.id)
        .then(data => res.status(201).json(data))
        .catch(err => res.status(400).json(err));

    })

    // add a user/ join a conversation
    conversationController.post('/:id/join', (req, res) => {

        queryAPI.joinConversationAllUsers(  
            req.params.id,
            req.body.users
        )
        .then(success => res.status(201).json(success))
        .catch(err => res.status(400).json(false));

    })

        // remove a user from a conversation
    conversationController.patch('/:id/leave', (req, res) => {
        queryAPI.removeAllUserFromConversation(  
            req.params.id,
            req.body.users
        )
        .then(success => res.status(201).json(success))
        .catch(err => res.status(400).json(false));
    })
  



    // get a single conversations
    conversationController.get('/:id', (req, res) => {
        
        var conversationObj;
        queryAPI.getSingleConversation(req.params.id)
        .then(conversation => {
            conversationObj = conversation;
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

  // get all conversations
  conversationController.get('/', (req, res) => {
    
       
        
      })
    

  return conversationController;
};