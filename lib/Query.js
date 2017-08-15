'use strict';
const bcrypt = require('bcrypt');
const knex = require('knex')({ client: 'mysql' });

const saltRounds = 10;

class Query {
   constructor(conn) {
      this.conn = conn;
   }


   createUser(user) {
     return bcrypt.hash(user.password, saltRounds).
     then((hash) => {
        return this.conn.query('INSERT INTO user (email, username, password) VALUES (?, ?, ?)',
        [user.email, user.username, hash ])
     })
     .then(result => {
            return result.insertId;
     });
   }
   
}

module.exports = Query;
