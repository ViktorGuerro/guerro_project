CREATE TABLE maps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) DEFAULT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 0
);

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
);

INSERT INTO game_state (id, mode, grid_enabled, grid_cell_size)
VALUES (1, 'prep', 1, 70);

CREATE TABLE dc_state (
    id INT PRIMARY KEY,
    dc_value TINYINT UNSIGNED DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

CREATE TABLE battle_overlay_state (
    id INT PRIMARY KEY,
    entity_id INT DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_battle_overlay_entity
        FOREIGN KEY (entity_id) REFERENCES entities(id)
        ON DELETE SET NULL
);

INSERT INTO battle_overlay_state (id, entity_id, visible_until)
VALUES (1, NULL, NULL);

CREATE TABLE ability_overlay_state (
    id INT PRIMARY KEY,
    icon_id INT DEFAULT NULL,
    range_cells INT DEFAULT NULL,
    visible_until DATETIME DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ability_overlay_icon
        FOREIGN KEY (icon_id) REFERENCES map_icons(id)
        ON DELETE SET NULL
);

INSERT INTO ability_overlay_state (id, icon_id, range_cells, visible_until)
VALUES (1, NULL, NULL, NULL);
