CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dice_overlay_state (
    id INT PRIMARY KEY,
    entity_id INT DEFAULT NULL,
    label VARCHAR(255) DEFAULT NULL,
    dice_type VARCHAR(10) DEFAULT NULL,
    dice_count INT DEFAULT NULL,
    dice_values_json TEXT DEFAULT NULL,
    modifier INT NOT NULL DEFAULT 0,
    total_value INT DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dice_overlay_entity
        FOREIGN KEY (entity_id) REFERENCES entities(id)
        ON DELETE SET NULL
);

INSERT INTO dice_overlay_state (
    id, entity_id, label, dice_type, dice_count, dice_values_json, modifier, total_value, visible_until
) VALUES (
    1, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO schema_migrations (migration_name)
VALUES ('002_add_dice_overlay_state.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
