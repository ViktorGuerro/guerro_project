<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$activeMapId = post_int('active_map_id');
$gridCellSize = post_int('grid_cell_size');

if ($gridCellSize !== null && ($gridCellSize < 20 || $gridCellSize > 300)) {
    api_error('invalid_grid_cell_size');
}

if ($activeMapId !== null) {
    $check = $pdo->prepare('SELECT id FROM maps WHERE id = :id');
    $check->execute(['id' => $activeMapId]);
    if (!$check->fetch()) {
        api_error('map_not_found');
    }

    $pdo->prepare('UPDATE maps SET is_active = 0')->execute();
    $pdo->prepare('UPDATE maps SET is_active = 1 WHERE id = :id')->execute(['id' => $activeMapId]);
}

$sets = [];
$params = [];
if ($activeMapId !== null) {
    $sets[] = 'active_map_id = :active_map_id';
    $params['active_map_id'] = $activeMapId;
}
if ($gridCellSize !== null) {
    $sets[] = 'grid_cell_size = :grid_cell_size';
    $params['grid_cell_size'] = $gridCellSize;
}

if ($sets !== []) {
    $params['id'] = 1;
    $sql = 'UPDATE game_state SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $pdo->prepare($sql)->execute($params);
}

api_ok();
