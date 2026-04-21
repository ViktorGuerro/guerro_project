CREATE TABLE IF NOT EXISTS schema_migrations (
                                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                                 migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

SET @migration_name := '003_expand_entities_side_enum_for_boss_and_npc.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = @migration_name
);

SET @table_exists := (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'entities'
);

SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'entities'
      AND column_name = 'side'
);

SET @current_column_type := (
    SELECT COLUMN_TYPE
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'entities'
      AND column_name = 'side'
    LIMIT 1
);

SET @need_modify := IF(
    @already_applied = 0
    AND @table_exists = 1
    AND @column_exists = 1
    AND @current_column_type <> 'enum(''hero'',''enemy'',''boss'',''npc'')',
    1,
    0
);

SET @modify_enum := IF(
    @need_modify = 1,
    'ALTER TABLE entities MODIFY COLUMN side ENUM(''hero'', ''enemy'', ''boss'', ''npc'') NOT NULL',
    'SELECT 1'
);

PREPARE stmt FROM @modify_enum;
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