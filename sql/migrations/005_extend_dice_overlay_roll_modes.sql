CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dice_overlay_state
    ADD COLUMN IF NOT EXISTS roll_mode ENUM('normal', 'advantage', 'disadvantage') NOT NULL DEFAULT 'normal' AFTER label,
    ADD COLUMN IF NOT EXISTS advantage_values_json TEXT DEFAULT NULL AFTER dice_groups_json,
    ADD COLUMN IF NOT EXISTS selected_roll TINYINT UNSIGNED DEFAULT NULL AFTER advantage_values_json;

INSERT INTO schema_migrations (migration_name)
VALUES ('005_extend_dice_overlay_roll_modes.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
