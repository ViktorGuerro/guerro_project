CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roll_result_overlay_state (
    id INT PRIMARY KEY,
    result_type VARCHAR(50) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    value_text VARCHAR(255) DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roll_result_overlay_state (
    id, result_type, title, subtitle, value_text, visible_until
) VALUES (
    1, NULL, NULL, NULL, NULL, NULL
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO schema_migrations (migration_name)
VALUES ('006_add_roll_result_overlay_state.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
