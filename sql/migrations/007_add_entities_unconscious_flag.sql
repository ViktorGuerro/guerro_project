CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

SET @migration_name := '007_add_entities_unconscious_flag.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = CONVERT(@migration_name USING utf8mb4) COLLATE utf8mb4_general_ci
);

SET @table_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'entities'
);

SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'entities'
      AND column_name = 'is_unconscious'
);

SET @add_column := IF(
    @already_applied = 0
    AND @table_exists = 1
    AND @column_exists = 0,
    'ALTER TABLE entities ADD COLUMN is_unconscious TINYINT(1) NOT NULL DEFAULT 0 AFTER is_visible',
    'SELECT 1'
);

PREPARE stmt FROM @add_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @insert_migration := IF(
    @already_applied = 0,
    CONCAT('INSERT INTO schema_migrations (migration_name) VALUES (''', REPLACE(@migration_name, '''', ''''''), ''')'),
    'SELECT 1'
);

PREPARE stmt FROM @insert_migration;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
