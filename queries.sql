create database chat_box;

use chat_box;

CREATE TABLE user (
  id INT AUTO_INCREMENT,
  email VARCHAR(80) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX (username),
  UNIQUE INDEX (email)
);

CREATE TABLE userMeta(
  user_id INT,
  key VARCHAR(80),
  value VARCHAR(255),

  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE

)

CREATE TABLE session(
  id INT AUTO_INCREMENT,
  user_id INT,
  token VARCHAR(50),
  UNIQUE KEY token (token),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
);


CREATE TABLE conversation(
id INT AUTO_INCREMENT,
name VARCHAR(80) NOT NULL,
admin INT,
created_at DATETIME NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (admin) REFERENCES user (id) ON DELETE CASCADE
);

CREATE TABLE message(
id INT AUTO_INCREMENT,
author INT,
created_at DATETIME NOT NULL,
type ENUM ('image','link','audio','text'),
conversation_id INT,
PRIMARY KEY (id),
UNIQUE INDEX (conversation_id),
FOREIGN KEY (author) REFERENCES user (id) ON DELETE CASCADE,
FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE
);

CREATE TABLE conversationUser(
user_id INT,
conversation_id INT,
joined_date DATETIME NOT NULL,
date_left DATETIME NOT NULL
FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE,
);
