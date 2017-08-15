'use strict';
const bcrypt = require('bcrypt');
const knex = require('knex')({ client: 'mysql' });
const validate = require('./validations');
const HASH_ROUNDS = 10;
const USER_FIELDS = ['id', 'email', 'username', 'password', 'firstName', 'lastName', 'language'];
const util = require('./util');


class Query {
   constructor(conn) {
      this.conn = conn;
   }

   query(sql) {
     return this.conn.query(sql);
   }

// Auth functions

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

// messages functions

  createMessage(message) {
    console.log("creating a message: ", message)
  }




}

module.exports = Query;
