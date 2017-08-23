-- DROP DATABASE IF EXISTS chat_box;
--
-- create database chat_box;
--
-- use chat_box;

CREATE TABLE user (
  id INT AUTO_INCREMENT,
  email VARCHAR(80) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(60) NOT NULL,
  lastName VARCHAR(80) NOT NULL,
  language ENUM('en', 'fr', 'es', 'pt', 'de', 'it', 'hi', 'ar', 'ru'),
  avatarUrl VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX (username),
  UNIQUE INDEX (email)
);

CREATE TABLE userMeta (
  user_id INT,
  user_key VARCHAR(80),
  value VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE session (
  id INT AUTO_INCREMENT,
  user_id INT,
  token VARCHAR(100),
  UNIQUE KEY token (token),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);


CREATE TABLE conversation (
id INT AUTO_INCREMENT,
name VARCHAR(80) NOT NULL,
admin INT,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id),
FOREIGN KEY (admin) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE conversionMeta (
  conversation_id INT NOT NULL,
  conversation_key VARCHAR(80),
  value VARCHAR(255),
  FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE
);

CREATE TABLE message (
id INT AUTO_INCREMENT,
author INT,
message_body TEXT,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
type ENUM ('image','link','audio','text'),
conversation_id INT,
PRIMARY KEY (id),
FOREIGN KEY (author) REFERENCES user (id) ON DELETE CASCADE,
FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE
);

CREATE TABLE conversationUser (
user_id INT,
conversation_id INT,
joined_date DATETIME NOT NULL DEFAULT NOW(),
date_left DATETIME,
FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE
);
