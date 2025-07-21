-- server/init.sql

CREATE DATABASE IF NOT EXISTS nodeland
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE nodeland;

-- Grant EVENT privilege to the user
GRANT EVENT ON *.* TO 'nodeland'@'%';

-- ── users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255)      NOT NULL,
  displayName  VARCHAR(255)      NOT NULL,
  email        VARCHAR(255),
  language     ENUM('en','no')   NOT NULL DEFAULT 'en',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── weather_stats ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_stats (
  `date`     DATE       NOT NULL PRIMARY KEY,
  `low`      FLOAT      NOT NULL,
  `high`     FLOAT      NOT NULL,
  `current`  FLOAT      NOT NULL,
  `updatedAt` TIMESTAMP NOT NULL
     DEFAULT CURRENT_TIMESTAMP
     ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── weather_readings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_readings (
  id        BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ts        BIGINT    NOT NULL,
  temp      FLOAT     NOT NULL,
  wind      FLOAT     NOT NULL,
  gust      FLOAT     NOT NULL,
  dir       FLOAT     NOT NULL,
  pressure  FLOAT     NOT NULL,
  rain      FLOAT     NOT NULL,
  uv        FLOAT     NOT NULL,
  solar     FLOAT     NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;