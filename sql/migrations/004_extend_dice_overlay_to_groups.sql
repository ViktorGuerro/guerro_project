CREATE TABLE IF NOT EXISTS schema_migrations (
                                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                                 migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

SET @migration_name := '004_extend_dice_overlay_to_groups.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = @migration_name
);

SET @add_dice_groups_json := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dice_overlay_state'
          AND column_name = 'dice_groups_json'
    ),
    'ALTER TABLE dice_overlay_state ADD COLUMN dice_groups_json TEXT DEFAULT NULL AFTER label',
    'SELECT 1'
);

PREPARE stmt FROM @add_dice_groups_json;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @insert_migration := IF(
    @already_applied = 0,
    CONCAT('INSERT INTO schema_migrations (migration_name) VALUES (''', @migration_name, ''')'),
    'SELECT 1'
);

PREPARE stmt FROM @insert_migration;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;