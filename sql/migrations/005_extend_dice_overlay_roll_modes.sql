CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

SET @migration_name := '005_extend_dice_overlay_roll_modes.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = CONVERT(@migration_name USING utf8mb4) COLLATE utf8mb4_general_ci
);

SET @add_roll_mode := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dice_overlay_state'
          AND column_name = 'roll_mode'
    ),
    'ALTER TABLE dice_overlay_state ADD COLUMN roll_mode ENUM(''normal'', ''advantage'', ''disadvantage'') NOT NULL DEFAULT ''normal'' AFTER label',
    'SELECT 1'
);
PREPARE stmt FROM @add_roll_mode;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_advantage_values_json := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dice_overlay_state'
          AND column_name = 'advantage_values_json'
    ),
    'ALTER TABLE dice_overlay_state ADD COLUMN advantage_values_json TEXT DEFAULT NULL AFTER dice_groups_json',
    'SELECT 1'
);
PREPARE stmt FROM @add_advantage_values_json;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_selected_roll := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dice_overlay_state'
          AND column_name = 'selected_roll'
    ),
    'ALTER TABLE dice_overlay_state ADD COLUMN selected_roll TINYINT UNSIGNED DEFAULT NULL AFTER advantage_values_json',
    'SELECT 1'
);
PREPARE stmt FROM @add_selected_roll;
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
