CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dice_overlay_state
    ADD COLUMN IF NOT EXISTS dice_groups_json TEXT DEFAULT NULL AFTER label;

INSERT INTO schema_migrations (migration_name)
VALUES ('004_extend_dice_overlay_to_groups.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
