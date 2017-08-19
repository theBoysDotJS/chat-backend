'use strict';
const bcrypt = require('bcrypt');
const knex = require('knex')({client: 'mysql'});
const validate = require('./validations');
const HASH_ROUNDS = 10;
const USER_FIELDS = [
	'id',
	'email',
	'username',
	'password',
	'firstName',
	'lastName',
	'language',
	'avatarUrl'
];
const MESSAGE_FIELDS = ['author', 'message_body', 'type', 'conversation_id'];
const MESSAGE_WRITE_FIELDS = ['message_body'];
const CONVERSATION_FIELDS = ['id', 'name', 'admin', 'created_at'];
const CONVERSATIONUSER = ['user_id', 'conversation_id'];
const util = require('./util');
const md5 = require('md5')

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
			return Promise.reject({errors: errors});
		}

		if (!user.avatarUrl) {
			let email = md5(user.email);
			user.avatarUrl = `https://www.gravatar.com/avatar/${email}?d=monsterid`
		}

		console.log(user)
		return bcrypt.hash(user.password, HASH_ROUNDS).then((hashedPassword) => {
			console.log(hashedPassword, 'the pw')
			return this.query(knex.insert({
				email: user.email,
				username: user.username,
				password: hashedPassword,
				firstName: user.firstName,
				lastName: user.lastName,
				language: user.language,
				avatarUrl: user.avatarUrl
			}).into('user').toString());
		}).then((result) => {
			console.log(result, 'this is first result')
			return this.query(knex.select(USER_FIELDS).from('user').where('id', result.insertId).toString());
		}).then(result => {
			console.log(result)
			return result[0]
		}).catch((error) => {
			if (error.code === 'ER_DUP_ENTRY') {
				throw new Error('A user with this email already exists');
			} else {
				throw error;
			}
		});
	}

	deleteUser(userId) {
		return this.query(knex.delete().from('user').where('id', userId).toString());
	}

	getUserFromSession(sessionToken) {
		return this.query(knex.select(util.joinKeys('user', USER_FIELDS)).from('session').join('user', 'session.user_id', '=', 'user.id').where({'session.token': sessionToken}).toString()).then((result) => {
			console.log(result, 'the result')
			if (result.length === 1) {
				return result[0];
			}
			return null;
		});
	}

	createTokenFromCredentials(email, password) {
		const errors = validate.credentials({email: email, password: password});
		if (errors) {
			return Promise.reject({errors: errors});
		}
		let sessionToken;
		let user;
		return this.query(knex.select('id', 'password').from('user').where('email', email).toString()).then((results) => {
			console.log(results)
			if (results.length === 1) {
				user = results[0];
				return bcrypt.compare(password, user.password).catch(() => false);
			}
			return false;
		}).then((result) => {
			if (result === true) {
				var t = util.getRandomToken();
				return t;
			}
			throw new Error('Username or password invalid');
		}).then((token) => {
			sessionToken = token;

			return this.query(knex.insert({user_id: user.id, token: sessionToken}).into('session').toString());
		}).then(() => sessionToken);
	}

	deleteToken(token) {
		return this.query(knex.delete().from('session').where('token', token).toString()).then(() => true);
	}

	returnFullUserObject(user) {
		return this.query(knex.select(USER_FIELDS).from('user').where('id', user).toString()).then((result) => result).catch(err => res.json(err.message))
	}

	// MESSAGE FUNCTIONS ----------------------------------------------------------

	// create a new message
	createMessage(message) {
		return this.query(knex.insert(util.filterKeys(MESSAGE_FIELDS, message)).into('message').toString()).catch(error => console.log(error, 'Message instert into database went wrong'));
	}

	// message belongs to user
	messageBelongsToUser(messageId, userId) {
		console.log("line 167 messagebelongstoUser, messageid and User Id: ", messageId, userId)
		return this.query(knex.select('id').from('message').where({author: userId, id: messageId}).toString()).then((results) => {
			console.log(results, "are there results?")
			//this will be false if nothing is returned, an empty array
			if (results.length === 1) {
				return true;
			} else {
				throw new Error('Access denied');
			}
		});
	}

	// edit/update a message
	editMessage(messageId, messageObj) {
		console.log("line 188 edit message function", messageObj)
		return this.query(knex('message').update(util.filterKeys(MESSAGE_WRITE_FIELDS, messageObj)).where({id: messageId}).toString()).then(() => {
			return this.query(knex.select(MESSAGE_FIELDS).from('message').where('id', messageId).toString());
		});
	}

	// delete a message
	deleteMessage(messageId) {
		return this.query(knex.delete().from('message').where('id', messageId).toString()).then(() => true);
	}

	// CONVERSATION QUERIES -------------------------------------------------------

	createNewConversation(conversation) {
		return this.query(knex.insert(conversation).into('conversation').toString()).then((result) => {
			return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', result.insertId).toString());
		}).then(result => {
			return result[0];
		}).catch((error) => {
			throw error;
		});
	}

	// update a conversation
	updateConversation(conversationId, conversation) {
		return this.query(knex('conversation').update(conversation).where({id: conversationId}).toString()).then(() => {
			return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', conversationId).toString());
		});
	}

	// delete a conversation

	deleteConversation(conversationId) {
		console.log("trying to delete..")
		return this.query(knex.delete().from('conversation').where('id', conversationId).toString());
	}

	// get all conversations
	getAllConversations(user) {
		var q = knex.select('*'). //CONVERSATION_FIELDS
		from('conversation').whereIn('id', function() {
			this.select('conversation_id').from('conversationUser').where('user_id', user)
		}).orWhere('admin', user).toString();
		return this.query(q);
	}

	// get a single conversation
	getSingleConversation(conversationId) {
		return this.query(knex.select(CONVERSATION_FIELDS).from('conversation').where('id', conversationId).toString())
	}

	getSingleConversationUser(conversationId) {

		var u = knex.select("*"). //TODO don't select *
		from('conversationuser').join('user', 'user_id', 'user.id').where({'conversation_id': conversationId, 'date_left': null}).toString();
		return this.query(u);
	}

	getSingleConversationMessages(conversationId, limit) {
		var limit = typeof limit === 'undefined'
			? 200
			: limit;
		console.log(limit, "in single funciton")
		var m = knex.select("*").from('message').where('conversation_id', conversationId).limit(2).toString();
		console.log(m)
		return this.query(m);
	}

	joinConversationAllUsers(conversation_id, users) {

		let promiseArray = [];
		for (let i = 0; i < users.length; i++) {
			let user = users[i];

			let promise = this.query(knex.insert({conversation_id: conversation_id, user_id: user}).into('conversationuser').toString()).then((result) => {
				return true
			}).catch((error) => {
				if (error.code === 'ER_NO_REFERENCED_ROW') {
					return false
				} else {
					throw error;
				}
			});

			promiseArray.push(promise)
		}

		return Promise.all(promiseArray).then(successArr => {
			for (let j = 0; j < successArr.length; j++) {
				if (!successArr[j]) {
					return false;
				}
			}
			return true;
		})
	}

	// remove all users from conversation....
	removeAllUserFromConversation(conversation_id, users) {

		console.log()
		var q = knex('conversationUser').where({'conversation_id': conversation_id}).whereIn('user_id', users).update({
			'date_left': new Date().toISOString().slice(0, 19).replace('T', ' ')
		}).toString();

		console.log(q, "users array")
		return this.query(q).then((result) => {
			console.log(result)
			return true
		}).catch((error) => {
			throw error;
		});
	}

	messageReceived(message) {

		return this.query(knex.insert({author: message.user, message_body: message.text, type: message.type, conversation_id: message.convoId}).into('message').toString()).catch((error) => {
			throw error;
		});
	}

	getUserLanguage(user_id) {
		return this.query(knex.select('language').from('user').where("id", user_id).toString()).catch((error) => {
			throw error;
		});
	}

}

module.exports = Query;
