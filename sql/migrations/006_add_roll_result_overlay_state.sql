CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

SET @migration_name := '006_add_roll_result_overlay_state.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = CONVERT(@migration_name USING utf8mb4) COLLATE utf8mb4_general_ci
);

SET @create_roll_result_table := IF(
    @already_applied = 0,
    'CREATE TABLE IF NOT EXISTS roll_result_overlay_state (
        id INT PRIMARY KEY,
        result_type VARCHAR(50) DEFAULT NULL,
        title VARCHAR(255) DEFAULT NULL,
        subtitle VARCHAR(255) DEFAULT NULL,
        value_text VARCHAR(255) DEFAULT NULL,
        visible_until DATETIME DEFAULT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
    'SELECT 1'
);
PREPARE stmt FROM @create_roll_result_table;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @insert_default_row := IF(
    @already_applied = 0,
    'INSERT INTO roll_result_overlay_state (id, result_type, title, subtitle, value_text, visible_until)
     VALUES (1, NULL, NULL, NULL, NULL, NULL)
     ON DUPLICATE KEY UPDATE id = id',
    'SELECT 1'
);
PREPARE stmt FROM @insert_default_row;
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
