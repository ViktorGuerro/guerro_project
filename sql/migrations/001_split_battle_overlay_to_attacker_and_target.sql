CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SET @migration_name := '001_split_battle_overlay_to_attacker_and_target.sql';

SET @already_applied := (
    SELECT COUNT(*)
    FROM schema_migrations
    WHERE migration_name = @migration_name
);

SET @add_attacker_col := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'battle_overlay_state'
          AND column_name = 'attacker_entity_id'
    ),
    'ALTER TABLE battle_overlay_state ADD COLUMN attacker_entity_id INT DEFAULT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @add_attacker_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_target_col := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'battle_overlay_state'
          AND column_name = 'target_entity_id'
    ),
    'ALTER TABLE battle_overlay_state ADD COLUMN target_entity_id INT DEFAULT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @add_target_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @copy_entity_to_attacker := IF(
    @already_applied = 0 AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'battle_overlay_state'
          AND column_name = 'entity_id'
    ),
    'UPDATE battle_overlay_state SET attacker_entity_id = entity_id WHERE attacker_entity_id IS NULL AND entity_id IS NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @copy_entity_to_attacker;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_attacker_fk := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_schema = DATABASE()
          AND tc.table_name = 'battle_overlay_state'
          AND tc.constraint_name = 'fk_battle_overlay_attacker_entity'
          AND tc.constraint_type = 'FOREIGN KEY'
    ),
    'ALTER TABLE battle_overlay_state ADD CONSTRAINT fk_battle_overlay_attacker_entity FOREIGN KEY (attacker_entity_id) REFERENCES entities(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @add_attacker_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_target_fk := IF(
    @already_applied = 0 AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_schema = DATABASE()
          AND tc.table_name = 'battle_overlay_state'
          AND tc.constraint_name = 'fk_battle_overlay_target_entity'
          AND tc.constraint_type = 'FOREIGN KEY'
    ),
    'ALTER TABLE battle_overlay_state ADD CONSTRAINT fk_battle_overlay_target_entity FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @add_target_fk;
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
