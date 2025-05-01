DELIMITER $$

CREATE PROCEDURE __add_language_if_not_exists__()
BEGIN
  IF NOT EXISTS (
    SELECT *
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'users'
      AND COLUMN_NAME  = 'language'
  ) THEN
    ALTER TABLE users
      ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en';
  END IF;
END$$

CALL __add_language_if_not_exists__()$$

DROP PROCEDURE __add_language_if_not_exists__$$

DELIMITER ;
