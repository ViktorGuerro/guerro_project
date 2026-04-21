CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
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
)
SELECT 1, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM dice_overlay_state WHERE id = 1);

INSERT INTO schema_migrations (version)
SELECT '20260421_000001_add_dice_overlay_state'
WHERE NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '20260421_000001_add_dice_overlay_state');
