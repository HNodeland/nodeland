CREATE TABLE IF NOT EXISTS weather_readings (
  id        BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ts        BIGINT      NOT NULL,
  temp      FLOAT       NOT NULL,
  wind      FLOAT       NOT NULL,
  gust      FLOAT       NOT NULL,
  dir       FLOAT       NOT NULL,
  pressure  FLOAT       NOT NULL,
  rain      FLOAT       NOT NULL,
  uv        FLOAT       NOT NULL,
  solar     FLOAT       NOT NULL,
  createdAt TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;