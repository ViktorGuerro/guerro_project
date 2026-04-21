<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$config = require __DIR__ . '/../inc/config.php';

$stateStmt = $pdo->query(
    'SELECT gs.mode, gs.grid_enabled, gs.grid_cell_size, gs.active_map_id, m.id AS map_id, m.title AS map_title, m.file_path AS map_file_path
     FROM game_state gs
     LEFT JOIN maps m ON m.id = gs.active_map_id
     WHERE gs.id = 1'
);
$state = $stateStmt->fetch() ?: ['mode' => 'prep', 'grid_enabled' => 1, 'grid_cell_size' => 70, 'active_map_id' => null];

$dcStmt = $pdo->query('SELECT dc_value, visible_until FROM dc_state WHERE id = 1');
$dc = $dcStmt->fetch() ?: ['dc_value' => null, 'visible_until' => null];
$dcVisible = $dc['visible_until'] !== null && strtotime((string) $dc['visible_until']) > time();


$battleOverlayStmt = $pdo->query(
    'SELECT
        bos.attacker_entity_id,
        bos.target_entity_id,
        bos.visible_until,
        attacker.id AS attacker_id,
        attacker.name AS attacker_name,
        attacker.side AS attacker_side,
        attacker.image_path AS attacker_image_path,
        attacker.armor_class AS attacker_armor_class,
        attacker.hp_current AS attacker_hp_current,
        attacker.hp_max AS attacker_hp_max,
        target.id AS target_id,
        target.name AS target_name,
        target.side AS target_side,
        target.image_path AS target_image_path,
        target.armor_class AS target_armor_class,
        target.hp_current AS target_hp_current,
        target.hp_max AS target_hp_max
     FROM battle_overlay_state bos
     LEFT JOIN entities attacker ON attacker.id = bos.attacker_entity_id
     LEFT JOIN entities target ON target.id = bos.target_entity_id
     WHERE bos.id = 1'
);
$battleOverlay = $battleOverlayStmt->fetch() ?: [
    'attacker_entity_id' => null,
    'target_entity_id' => null,
    'visible_until' => null,
    'attacker_id' => null,
    'target_id' => null,
];
$battleOverlayVisible = $battleOverlay['visible_until'] !== null
    && strtotime((string) $battleOverlay['visible_until']) > time()
    && $battleOverlay['attacker_id'] !== null
    && $battleOverlay['target_id'] !== null;

$abilityRangeStmt = $pdo->query(
    'SELECT ars.icon_id, ars.range_cells, ars.visible_until, mi.grid_x, mi.grid_y, mi.size_cells
     FROM ability_overlay_state ars
     LEFT JOIN map_icons mi ON mi.id = ars.icon_id
     WHERE ars.id = 1'
);
$abilityRange = $abilityRangeStmt->fetch() ?: ['icon_id' => null, 'range_cells' => null, 'visible_until' => null, 'grid_x' => null, 'grid_y' => null, 'size_cells' => null];
$abilityRangeVisible = $abilityRange['visible_until'] !== null && strtotime((string) $abilityRange['visible_until']) > time() && $abilityRange['icon_id'] !== null && $abilityRange['range_cells'] !== null;

$entities = $pdo->query('SELECT id, name, side, image_path, armor_class, hp_current, hp_max, sort_order, is_visible FROM entities ORDER BY sort_order, id')->fetchAll();

$icons = $pdo->query(
    'SELECT mi.id, mi.entity_id, mi.grid_x, mi.grid_y, mi.size_cells, mi.is_visible, e.name, e.image_path, e.side
     FROM map_icons mi
     INNER JOIN entities e ON e.id = mi.entity_id
     ORDER BY mi.id'
)->fetchAll();

api_ok([
    'mode' => $state['mode'],
    'active_map' => $state['map_id'] ? [
        'id' => (int) $state['map_id'],
        'title' => $state['map_title'],
        'file_path' => $state['map_file_path'],
    ] : null,
    'grid_enabled' => (bool) $state['grid_enabled'],
    'grid_cell_size' => (int) $state['grid_cell_size'],
    'dc_value' => $dcVisible ? ($dc['dc_value'] !== null ? (int) $dc['dc_value'] : null) : null,
    'dc_visible' => $dcVisible,
    'entities' => array_map(static function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['sort_order'] = (int) $row['sort_order'];
        $row['is_visible'] = (int) $row['is_visible'];
        $row['armor_class'] = $row['armor_class'] !== null ? (int) $row['armor_class'] : null;
        $row['hp_current'] = $row['hp_current'] !== null ? (int) $row['hp_current'] : null;
        $row['hp_max'] = $row['hp_max'] !== null ? (int) $row['hp_max'] : null;
        return $row;
    }, $entities),
    'icons' => array_map(static function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['entity_id'] = (int) $row['entity_id'];
        $row['grid_x'] = (int) $row['grid_x'];
        $row['grid_y'] = (int) $row['grid_y'];
        $row['size_cells'] = (int) $row['size_cells'];
        $row['is_visible'] = (int) $row['is_visible'];
        return $row;
    }, $icons),

    'battle_overlay' => [
        'active' => $battleOverlayVisible,
        'attacker' => $battleOverlayVisible ? [
            'id' => (int) $battleOverlay['attacker_id'],
            'name' => $battleOverlay['attacker_name'],
            'side' => $battleOverlay['attacker_side'],
            'image_path' => $battleOverlay['attacker_image_path'],
            'armor_class' => $battleOverlay['attacker_armor_class'] !== null ? (int) $battleOverlay['attacker_armor_class'] : null,
            'hp_current' => $battleOverlay['attacker_hp_current'] !== null ? (int) $battleOverlay['attacker_hp_current'] : null,
            'hp_max' => $battleOverlay['attacker_hp_max'] !== null ? (int) $battleOverlay['attacker_hp_max'] : null,
        ] : null,
        'target' => $battleOverlayVisible ? [
            'id' => (int) $battleOverlay['target_id'],
            'name' => $battleOverlay['target_name'],
            'side' => $battleOverlay['target_side'],
            'image_path' => $battleOverlay['target_image_path'],
            'armor_class' => $battleOverlay['target_armor_class'] !== null ? (int) $battleOverlay['target_armor_class'] : null,
            'hp_current' => $battleOverlay['target_hp_current'] !== null ? (int) $battleOverlay['target_hp_current'] : null,
            'hp_max' => $battleOverlay['target_hp_max'] !== null ? (int) $battleOverlay['target_hp_max'] : null,
        ] : null,
    ],
    'ability_overlay' => [
        'active' => $abilityRangeVisible,
        'icon_id' => $abilityRangeVisible ? (int) $abilityRange['icon_id'] : null,
        'range_cells' => $abilityRangeVisible ? (int) $abilityRange['range_cells'] : null,
        'grid_x' => $abilityRangeVisible ? (int) $abilityRange['grid_x'] : null,
        'grid_y' => $abilityRangeVisible ? (int) $abilityRange['grid_y'] : null,
        'size_cells' => $abilityRangeVisible ? (int) $abilityRange['size_cells'] : null,
    ],
    'poll_interval_ms' => (int) $config['app']['poll_interval_ms'],
]);
