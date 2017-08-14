'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;


class Query {
    constructor(conn) {
     this.conn = conn;
     }

   createUser(user) {
     console.log('this',this)
      let that=this
     //hash password
     return bcrypt.hash(user.password, saltRounds).
     then(function(hash) {
      //  console.log('this2',that)
       //insert info in data base
        return that.conn.query('INSERT INTO user (email,username,password) VALUES (?, ?, ?)',
        [user.email, user.username, hash ])
     })
     .then(result => {
            return result.insertId;
     });

   }
}
module.exports = Query;
