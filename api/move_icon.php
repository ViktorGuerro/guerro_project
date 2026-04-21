<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
$gridX = post_int('grid_x');
$gridY = post_int('grid_y');

if ($id === null || $gridX === null || $gridY === null) {
    api_error('invalid_params');
}

$stmt = $pdo->prepare('UPDATE map_icons SET grid_x = :grid_x, grid_y = :grid_y WHERE id = :id');
$stmt->execute([
    'id' => $id,
    'grid_x' => $gridX,
    'grid_y' => $gridY,
]);

api_ok();
