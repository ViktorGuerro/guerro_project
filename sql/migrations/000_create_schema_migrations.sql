CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (migration_name)
SELECT '000_create_schema_migrations.sql'
WHERE NOT EXISTS (
    SELECT 1 FROM schema_migrations WHERE migration_name = '000_create_schema_migrations.sql'
);
