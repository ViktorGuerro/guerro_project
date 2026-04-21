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
    'SELECT bos.entity_id, bos.visible_until, e.id AS entity_id_full, e.name, e.side, e.image_path, e.armor_class, e.hp_current, e.hp_max
     FROM battle_overlay_state bos
     LEFT JOIN entities e ON e.id = bos.entity_id
     WHERE bos.id = 1'
);
$battleOverlay = $battleOverlayStmt->fetch() ?: ['entity_id' => null, 'visible_until' => null];
$battleOverlayVisible = $battleOverlay['visible_until'] !== null && strtotime((string) $battleOverlay['visible_until']) > time() && $battleOverlay['entity_id_full'] !== null;

$abilityRangeStmt = $pdo->query(
    'SELECT ars.icon_id, ars.range_cells, ars.visible_until, mi.grid_x, mi.grid_y, mi.size_cells
     FROM ability_overlay_state ars
     LEFT JOIN map_icons mi ON mi.id = ars.icon_id
     WHERE ars.id = 1'
);
$abilityRange = $abilityRangeStmt->fetch() ?: ['icon_id' => null, 'range_cells' => null, 'visible_until' => null, 'grid_x' => null, 'grid_y' => null, 'size_cells' => null];
$abilityRangeVisible = $abilityRange['visible_until'] !== null && strtotime((string) $abilityRange['visible_until']) > time() && $abilityRange['icon_id'] !== null && $abilityRange['range_cells'] !== null;

$diceOverlayStmt = $pdo->query(
    'SELECT dos.entity_id, dos.label, dos.dice_type, dos.dice_count, dos.dice_values_json, dos.modifier, dos.total_value, dos.visible_until,
            e.id AS entity_id_full, e.name, e.side, e.image_path
     FROM dice_overlay_state dos
     LEFT JOIN entities e ON e.id = dos.entity_id
     WHERE dos.id = 1'
);
$diceOverlay = $diceOverlayStmt->fetch() ?: ['entity_id' => null, 'visible_until' => null];
$diceValues = [];
if (!empty($diceOverlay['dice_values_json'])) {
    $decodedValues = json_decode((string) $diceOverlay['dice_values_json'], true);
    if (is_array($decodedValues)) {
        foreach ($decodedValues as $value) {
            if (is_numeric($value)) {
                $diceValues[] = (int) $value;
            }
        }
    }
}
$diceOverlayVisible = $diceOverlay['visible_until'] !== null
    && strtotime((string) $diceOverlay['visible_until']) > time()
    && !empty($diceOverlay['dice_type'])
    && !empty($diceValues);

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
        'entity' => $battleOverlayVisible ? [
            'id' => (int) $battleOverlay['entity_id_full'],
            'name' => $battleOverlay['name'],
            'side' => $battleOverlay['side'],
            'image_path' => $battleOverlay['image_path'],
            'armor_class' => $battleOverlay['armor_class'] !== null ? (int) $battleOverlay['armor_class'] : null,
            'hp_current' => $battleOverlay['hp_current'] !== null ? (int) $battleOverlay['hp_current'] : null,
            'hp_max' => $battleOverlay['hp_max'] !== null ? (int) $battleOverlay['hp_max'] : null,
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
    'dice_overlay' => [
        'active' => $diceOverlayVisible,
        'entity' => $diceOverlayVisible && $diceOverlay['entity_id_full'] !== null ? [
            'id' => (int) $diceOverlay['entity_id_full'],
            'name' => $diceOverlay['name'],
            'side' => $diceOverlay['side'],
            'image_path' => $diceOverlay['image_path'],
        ] : null,
        'label' => $diceOverlayVisible ? (string) ($diceOverlay['label'] ?? '') : '',
        'dice_type' => $diceOverlayVisible ? (string) $diceOverlay['dice_type'] : null,
        'dice_count' => $diceOverlayVisible ? (int) $diceOverlay['dice_count'] : 0,
        'dice_values' => $diceOverlayVisible ? $diceValues : [],
        'modifier' => $diceOverlayVisible ? (int) $diceOverlay['modifier'] : 0,
        'total_value' => $diceOverlayVisible ? (int) $diceOverlay['total_value'] : null,
    ],
    'poll_interval_ms' => (int) $config['app']['poll_interval_ms'],
]);
