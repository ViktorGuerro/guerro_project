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


$diceOverlayStmt = $pdo->query(
    'SELECT
        dos.entity_id,
        dos.label,
        dos.roll_mode,
        dos.dice_groups_json,
        dos.advantage_values_json,
        dos.selected_roll,
        dos.dice_type,
        dos.dice_count,
        dos.dice_values_json,
        dos.modifier,
        dos.total_value,
        dos.visible_until,
        e.id AS dice_entity_id,
        e.name AS dice_entity_name,
        e.side AS dice_entity_side,
        e.image_path AS dice_entity_image_path
     FROM dice_overlay_state dos
     LEFT JOIN entities e ON e.id = dos.entity_id
     WHERE dos.id = 1'
);
$diceOverlay = $diceOverlayStmt->fetch() ?: [
    'entity_id' => null,
    'label' => null,
    'roll_mode' => 'normal',
    'advantage_values_json' => null,
    'selected_roll' => null,
    'dice_type' => null,
    'dice_count' => null,
    'dice_values_json' => null,
    'modifier' => 0,
    'total_value' => null,
    'visible_until' => null,
    'dice_entity_id' => null,
];
$rollMode = in_array($diceOverlay['roll_mode'], ['normal', 'advantage', 'disadvantage'], true)
    ? (string) $diceOverlay['roll_mode']
    : 'normal';
$diceGroups = [];
if ($diceOverlay['dice_groups_json'] !== null) {
    $decodedGroups = json_decode((string) $diceOverlay['dice_groups_json'], true);
    if (is_array($decodedGroups)) {
        foreach ($decodedGroups as $group) {
            if (!is_array($group)) {
                continue;
            }
            $diceType = isset($group['dice_type']) ? (string) $group['dice_type'] : null;
            $diceCount = filter_var($group['dice_count'] ?? null, FILTER_VALIDATE_INT);
            $rawValues = $group['dice_values'] ?? null;
            if ($diceType === null || $diceCount === false || !is_array($rawValues)) {
                continue;
            }

            $diceValues = [];
            foreach ($rawValues as $rawValue) {
                $value = filter_var($rawValue, FILTER_VALIDATE_INT);
                if ($value !== false) {
                    $diceValues[] = (int) $value;
                }
            }

            if (count($diceValues) !== (int) $diceCount) {
                continue;
            }

            $diceGroups[] = [
                'dice_type' => $diceType,
                'dice_count' => (int) $diceCount,
                'dice_values' => $diceValues,
            ];
        }
    }
}

if (!$diceGroups && $diceOverlay['dice_type'] !== null && $diceOverlay['dice_count'] !== null && $diceOverlay['dice_values_json'] !== null) {
    $decodedValues = json_decode((string) $diceOverlay['dice_values_json'], true);
    if (is_array($decodedValues)) {
        $diceValues = [];
        foreach ($decodedValues as $decodedValue) {
            $value = filter_var($decodedValue, FILTER_VALIDATE_INT);
            if ($value !== false) {
                $diceValues[] = (int) $value;
            }
        }
        if (count($diceValues) === (int) $diceOverlay['dice_count']) {
            $diceGroups[] = [
                'dice_type' => (string) $diceOverlay['dice_type'],
                'dice_count' => (int) $diceOverlay['dice_count'],
                'dice_values' => $diceValues,
            ];
        }
    }
}

$advantageValues = null;
if ($diceOverlay['advantage_values_json'] !== null) {
    $decodedAdvantageValues = json_decode((string) $diceOverlay['advantage_values_json'], true);
    if (is_array($decodedAdvantageValues) && count($decodedAdvantageValues) === 2) {
        $parsed = [];
        foreach ($decodedAdvantageValues as $rawValue) {
            $value = filter_var($rawValue, FILTER_VALIDATE_INT);
            if ($value === false || $value < 1 || $value > 20) {
                $parsed = [];
                break;
            }
            $parsed[] = (int) $value;
        }
        if (count($parsed) === 2) {
            $advantageValues = $parsed;
        }
    }
}

$selectedRoll = $diceOverlay['selected_roll'] !== null ? (int) $diceOverlay['selected_roll'] : null;
$criticalState = 'none';
if ($rollMode === 'advantage' || $rollMode === 'disadvantage') {
    if ($selectedRoll === 20) {
        $criticalState = 'success';
    } elseif ($selectedRoll === 1) {
        $criticalState = 'fail';
    }
} else {
    $d20Groups = array_values(array_filter($diceGroups, static fn (array $group): bool => $group['dice_type'] === 'd20'));
    if (count($d20Groups) === 1 && $d20Groups[0]['dice_count'] === 1 && count($d20Groups[0]['dice_values']) === 1) {
        if ($d20Groups[0]['dice_values'][0] === 20) {
            $criticalState = 'success';
        } elseif ($d20Groups[0]['dice_values'][0] === 1) {
            $criticalState = 'fail';
        }
    }
}

$diceOverlayVisible = $diceOverlay['visible_until'] !== null
    && strtotime((string) $diceOverlay['visible_until']) > time()
    && count($diceGroups) > 0;

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

    'dice_overlay' => [
        'active' => $diceOverlayVisible,
        'entity' => $diceOverlayVisible && $diceOverlay['dice_entity_id'] !== null ? [
            'id' => (int) $diceOverlay['dice_entity_id'],
            'name' => $diceOverlay['dice_entity_name'],
            'side' => $diceOverlay['dice_entity_side'],
            'image_path' => $diceOverlay['dice_entity_image_path'],
        ] : null,
        'label' => $diceOverlayVisible ? $diceOverlay['label'] : null,
        'roll_mode' => $diceOverlayVisible ? $rollMode : 'normal',
        'groups' => $diceOverlayVisible ? $diceGroups : [],
        'advantage_values' => $diceOverlayVisible ? $advantageValues : null,
        'selected_roll' => $diceOverlayVisible ? $selectedRoll : null,
        'modifier' => $diceOverlayVisible ? (int) $diceOverlay['modifier'] : 0,
        'total_value' => $diceOverlayVisible ? (int) $diceOverlay['total_value'] : null,
        'critical_state' => $diceOverlayVisible ? $criticalState : 'none',
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
