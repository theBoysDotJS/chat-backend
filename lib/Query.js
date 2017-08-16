
'use strict';
const bcrypt = require('bcrypt');
const knex = require('knex')({ client: 'mysql' });
const validate = require('./validations');
const HASH_ROUNDS = 10;
const USER_FIELDS = ['id', 'email', 'username', 'password', 'firstName', 'lastName', 'language'];
const CONVERSATION_FIELDS = ['id', 'name', 'admin', 'created_at'];
const CONVERSATIONUSER=['user_id','conversation_id']
const util = require('./util');
class Query {
    constructor(conn) {
        this.conn = conn;

        
    }

    query(sql) {
      return this.conn.query(sql);
    }

  createUser(user) {
    const errors = validate.user(user);
    if (errors) {

      return Promise.reject({ errors: errors });
    }

    return bcrypt.hash(user.password, HASH_ROUNDS)
    .then((hashedPassword) => {

      return this.query(
        knex
        .insert({
          email: user.email,
          username: user.username,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          language: user.language
        })
        .into('user')
        .toString()
      );
    })
    .then((result) => {
      return this.query(
        knex
        .select(USER_FIELDS)
        .from('user')
        .where('id', result.insertId)
        .toString()
      );
    })
    .then(result => {
    return result[0]
  })
    .catch((error) => {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('A user with this email already exists');
      } else {
        throw error;
      }
    });
  }

  deleteUser(userId) {
    return this.query(
      knex.delete().from('user').where('id', userId).toString()
    );
  }

  getUserFromSession(sessionToken) {
    return this.query(
      knex
      .select(util.joinKeys('user', USER_FIELDS))
      .from('sessions')
      .join('user', 'sessions.userId', '=', 'users.id')
      .where({
        'sessions.token': sessionToken
      })
      .toString()
    )
    .then((result) => {
    console.log(result, 'the result')
      if (result.length === 1) {
        return result[0];
      }
      return null;
    });
  }

  createTokenFromCredentials(email, password) {
    const errors = validate.credentials({
      email: email,
      password: password
    });
    if (errors) {
      return Promise.reject({ errors: errors });
    }
    let sessionToken;
    let user;
    return this.query(
      knex
      .select('id', 'password')
      .from('user')
      .where('email', email)
      .toString()
    )
    .then((results) => {
      console.log(results)
      if (results.length === 1) {
        user = results[0];
        return bcrypt.compare(password, user.password).catch(() => false);
      }
      return false;
    })
    .then((result) => {
    console.log('result in thign', result)
      if (result === true) {

        var t = util.getRandomToken();
        console.log("eeeeeeeeeeeeee", t)
        return t;
      }
      throw new Error('Username or password invalid');
    })
    .then((token) => {
      sessionToken = token;

      return this.query(
        knex
        .insert({
          user_id: user.id,
          token: sessionToken
        })
        .into('session')
        .toString()
      );
    })
    .then(() => sessionToken);
  }

  deleteToken(token) {
    return this.query(
      knex
      .delete()
      .from('session')
      .where('token', token)
      .toString()
    )
    .then(() => true);
  }

  //////////////////////////////////////////////////////////////////////////

  createNewConversation(conversation){
    return this.query(
      knex
      .insert(conversation)
      .into('conversation')
      .toString()
    )
    .then((result) => {
      return this.query(
        knex
        .select(CONVERSATION_FIELDS)
        .from('conversation')
        .where('id', result.insertId)
        .toString()
      );
    })
    .then(result => {
		  return result[0];
    })
    .catch((error) => {
      throw error;
    });
  }

  updateConversation(conversationId, conversation){
   
    return this.query(
      knex('conversation')
      .update(conversation)
      .where({
        id: conversationId
      })
      .toString())
      .then(() => {
        return this.query(
          knex
          .select(CONVERSATION_FIELDS)
          .from('conversation')
          .where('id', conversationId)
          .toString()
        );
    });
  }

  deleteConversation(conversationId){

    return this.query(

      knex.delete()
      .from('conversation')
      .where('id', conversationId)
      .toString()
    );

  }


  

  joinConversationAllUsers(conversation_id,users){
    
    let promiseArray=[];
    for(let i=0 ; i < users.length ; i++){
     let user = users[i];
    
     let promise =  this.query(
      knex
      .insert(
        {
        conversation_id: conversation_id,
        user_id:user
        })
      .into('conversationuser')
      .toString()
    )
    .then((result) => {
      return true
    })
    .catch((error) => {
      if (error.code=== 'ER_NO_REFERENCED_ROW') {
        return false
      } else {
        throw error;
      }
    });

     promiseArray.push(
       promise
      )
    }

    return Promise.all(promiseArray).then(successArr => {
      for(let j=0; j<successArr.length; j++){
        if(!successArr[j]){
         return false;
        }
      }
      return true;
    })
  }

  removeAllUserFromConversation(conversation_id,users){

    let promiseArray=[];
    
    for(let i=0 ; i < users.length ; i++){
     let user = users[i];
    
     let promise =  this.query(
      knex
      .delete()
      .from('conversationuser')
      .where({
        'conversation_id': conversation_id,
        'user_id':user
      })
      .toString()
      
    )
    .then((result) => {
      console.log(result)
      return true
    })
    .catch((error) => {
      throw error;
    });

     promiseArray.push(
       promise
      )
    }

    return Promise.all(promiseArray).then(successArr => {
      for(let j=0; j<successArr.length; j++){
        if(!successArr[j]){
         return false;
        }
      }
      return true;
    })

  }

  getSingleConversation(conversationId){
    
    return this.query(
      knex.select(CONVERSATION_FIELDS)
      .from('conversation')
      .where('id', conversationId)
      .toString()

    )



  }

  getSingleConversationUser(conversationId){
  
        var u = knex.select("*")
        .from('conversationuser')
        .join('user','user_id','user.id')
        .where('conversation_id', conversationId)
        .toString();
        
        return this.query(u);
      }


      getSingleConversationMessages(conversationId){
        
              var m = knex.select("*")
              .from('message')
              .where('conversation_id', conversationId)
              .toString();
              
              return this.query(m);
      }
////////////////////////////////////////////////////////////////////////////




}





module.exports = Query;


