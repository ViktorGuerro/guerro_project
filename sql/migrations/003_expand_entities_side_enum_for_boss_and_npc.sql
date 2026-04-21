CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE entities
    MODIFY side ENUM('hero', 'enemy', 'boss', 'npc') NOT NULL;

INSERT INTO schema_migrations (migration_name)
VALUES ('003_expand_entities_side_enum_for_boss_and_npc.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
