<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$config = require __DIR__ . '/../inc/config.php';

$stateStmt = $pdo->query(
    'SELECT gs.mode, gs.grid_cell_size, gs.active_map_id, m.id AS map_id, m.title AS map_title, m.file_path AS map_file_path
     FROM game_state gs
     LEFT JOIN maps m ON m.id = gs.active_map_id
     WHERE gs.id = 1'
);
$state = $stateStmt->fetch() ?: ['mode' => 'prep', 'grid_cell_size' => 70, 'active_map_id' => null];

$dcStmt = $pdo->query('SELECT dc_value, visible_until FROM dc_state WHERE id = 1');
$dc = $dcStmt->fetch() ?: ['dc_value' => null, 'visible_until' => null];
$dcVisible = $dc['visible_until'] !== null && strtotime((string) $dc['visible_until']) > time();

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
    'poll_interval_ms' => (int) $config['app']['poll_interval_ms'],
]);
