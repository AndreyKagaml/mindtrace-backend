CREATE DATABASE `MindTrace`;

USE `MindTrace`;
 
CREATE TABLE `users` (
	id INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(70) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from `users`;

/* REGISTER USER IN APP*/

select * from `moods` where user_id = ?;

CREATE TABLE emotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    record_date DATE NOT NULL DEFAULT (CURRENT_DATE),

    joy TINYINT NOT NULL DEFAULT 0,
    sadness TINYINT NOT NULL DEFAULT 0,
    fear TINYINT NOT NULL DEFAULT 0,
    anger TINYINT NOT NULL DEFAULT 0,
    surprise TINYINT NOT NULL DEFAULT 0,

    CHECK (joy BETWEEN 0 AND 5),
    CHECK (sadness BETWEEN 0 AND 5),
    CHECK (fear BETWEEN 0 AND 5),
    CHECK (anger BETWEEN 0 AND 5),
    CHECK (surprise BETWEEN 0 AND 5),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, record_date)
);

CREATE TABLE chat_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    analysis TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, chat_date)
);

CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_session_id BIGINT NOT NULL,
    sender ENUM('user', 'psychologist') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_chat_messages_session_created
        (chat_session_id, created_at, id),

    FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE TABLE diary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);










INSERT INTO emotions (user_id, record_date, joy, sadness, fear, anger, surprise) VALUES
(1, '2026-10-01', 5, 0, 0, 0, 3),
(1, '2026-10-03', 3, 1, 0, 0, 2),
(1, '2026-10-05', 1, 3, 2, 1, 0),
(1, '2026-10-07', 5, 0, 0, 0, 5),
(1, '2026-10-10', 2, 1, 1, 0, 1),
(1, '2026-10-11', 1, 4, 2, 2, 0),
(1, '2026-10-02', 4, 0, 1, 0, 3),
(1, '2026-10-08', 2, 2, 4, 1, 1),
(1, '2026-10-04', 5, 0, 0, 0, 4),
(1, '2026-10-09', 4, 0, 0, 0, 2);