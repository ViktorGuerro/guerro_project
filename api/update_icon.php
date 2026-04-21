<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
$gridX = post_int('grid_x');
$gridY = post_int('grid_y');
$sizeCells = post_int('size_cells');

if ($id === null || $gridX === null || $gridY === null || $sizeCells === null) {
    api_error('invalid_params');
}
if ($gridX < 0 || $gridY < 0) {
    api_error('invalid_grid_position');
}
if ($sizeCells < 1 || $sizeCells > 4) {
    api_error('invalid_size_cells');
}

$exists = $pdo->prepare('SELECT id FROM map_icons WHERE id = :id');
$exists->execute(['id' => $id]);
if (!$exists->fetch()) {
    api_error('icon_not_found', 404);
}

$stmt = $pdo->prepare('UPDATE map_icons SET grid_x = :grid_x, grid_y = :grid_y, size_cells = :size_cells WHERE id = :id');
$stmt->execute([
    'id' => $id,
    'grid_x' => $gridX,
    'grid_y' => $gridY,
    'size_cells' => $sizeCells,
]);

api_ok();
