CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255) NOT NULL PRIMARY KEY,
  displayName  VARCHAR(255) NOT NULL,
  email        VARCHAR(255),
  createdAt    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  language     VARCHAR(5)     NOT NULL DEFAULT 'en'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
