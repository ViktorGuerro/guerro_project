CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (migration_name)
VALUES ('000_create_schema_migrations.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
