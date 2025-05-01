CREATE DATABASE IF NOT EXISTS nodeland CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nodeland;

CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255)      NOT NULL,
  displayName  VARCHAR(255)      NOT NULL,
  email        VARCHAR(255),
  language     ENUM('en','no')   NOT NULL DEFAULT 'en',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;