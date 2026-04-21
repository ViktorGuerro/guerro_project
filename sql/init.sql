CREATE TABLE maps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) DEFAULT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE game_state (
    id INT PRIMARY KEY,
    mode ENUM('prep', 'map') NOT NULL DEFAULT 'prep',
    active_map_id INT DEFAULT NULL,
    grid_enabled TINYINT(1) NOT NULL DEFAULT 1,
    grid_cell_size INT NOT NULL DEFAULT 70,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_state_map
        FOREIGN KEY (active_map_id) REFERENCES maps(id)
        ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO game_state (id, mode, grid_enabled, grid_cell_size)
VALUES (1, 'prep', 1, 70);

CREATE TABLE dc_state (
    id INT PRIMARY KEY,
    dc_value TINYINT UNSIGNED DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO dc_state (id, dc_value, visible_until)
VALUES (1, NULL, NULL);

CREATE TABLE entities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    side ENUM('hero', 'enemy', 'boss', 'npc') NOT NULL,
    image_path VARCHAR(500) DEFAULT NULL,
    armor_class TINYINT UNSIGNED DEFAULT NULL,
    hp_current INT DEFAULT NULL,
    hp_max INT DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    is_unconscious TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE map_icons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT NOT NULL,
    grid_x INT NOT NULL DEFAULT 0,
    grid_y INT NOT NULL DEFAULT 0,
    size_cells INT NOT NULL DEFAULT 1,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_map_icons_entity
        FOREIGN KEY (entity_id) REFERENCES entities(id)
        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE battle_overlay_state (
    id INT PRIMARY KEY,
    attacker_entity_id INT DEFAULT NULL,
    target_entity_id INT DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_battle_overlay_attacker_entity
        FOREIGN KEY (attacker_entity_id) REFERENCES entities(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_battle_overlay_target_entity
        FOREIGN KEY (target_entity_id) REFERENCES entities(id)
        ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO battle_overlay_state (id, attacker_entity_id, target_entity_id, visible_until)
VALUES (1, NULL, NULL, NULL);

CREATE TABLE dice_overlay_state (
    id INT PRIMARY KEY,
    entity_id INT DEFAULT NULL,
    label VARCHAR(255) DEFAULT NULL,
    roll_mode ENUM('normal', 'advantage', 'disadvantage') NOT NULL DEFAULT 'normal',
    dice_groups_json TEXT DEFAULT NULL,
    advantage_values_json TEXT DEFAULT NULL,
    selected_roll TINYINT UNSIGNED DEFAULT NULL,
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO dice_overlay_state (id, entity_id, label, roll_mode, dice_groups_json, advantage_values_json, selected_roll, dice_type, dice_count, dice_values_json, modifier, total_value, visible_until)
VALUES (1, NULL, NULL, 'normal', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL);

CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE ability_overlay_state (
    id INT PRIMARY KEY,
    icon_id INT DEFAULT NULL,
    range_cells INT DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ability_overlay_icon
        FOREIGN KEY (icon_id) REFERENCES map_icons(id)
        ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO ability_overlay_state (id, icon_id, range_cells, visible_until)
VALUES (1, NULL, NULL, NULL);

CREATE TABLE roll_result_overlay_state (
    id INT PRIMARY KEY,
    result_type VARCHAR(50) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    value_text VARCHAR(255) DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO roll_result_overlay_state (id, result_type, title, subtitle, value_text, visible_until)
VALUES (1, NULL, NULL, NULL, NULL, NULL);

INSERT IGNORE INTO schema_migrations (migration_name) VALUES
    ('000_create_schema_migrations.sql'),
    ('001_split_battle_overlay_to_attacker_and_target.sql'),
    ('002_add_dice_overlay_state.sql'),
    ('003_expand_entities_side_enum_for_boss_and_npc.sql'),
    ('004_extend_dice_overlay_to_groups.sql'),
    ('005_extend_dice_overlay_roll_modes.sql'),
    ('006_add_roll_result_overlay_state.sql'),
    ('007_add_entities_unconscious_flag.sql');
