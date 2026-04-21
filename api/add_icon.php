<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$entityId = post_int('entity_id');
$gridX = post_int('grid_x', 0) ?? 0;
$gridY = post_int('grid_y', 0) ?? 0;
$sizeCells = post_int('size_cells', 1) ?? 1;

if ($entityId === null) {
    api_error('entity_id_required');
}
if ($gridX < 0 || $gridY < 0) {
    api_error('invalid_grid_position');
}
if ($sizeCells < 1 || $sizeCells > 4) {
    api_error('invalid_size_cells');
}

$check = $pdo->prepare('SELECT id FROM entities WHERE id = :id');
$check->execute(['id' => $entityId]);
if (!$check->fetch()) {
    api_error('entity_not_found', 404);
}

$stmt = $pdo->prepare('INSERT INTO map_icons (entity_id, grid_x, grid_y, size_cells) VALUES (:entity_id, :grid_x, :grid_y, :size_cells)');
$stmt->execute([
    'entity_id' => $entityId,
    'grid_x' => $gridX,
    'grid_y' => $gridY,
    'size_cells' => $sizeCells,
]);

api_ok(['id' => (int) $pdo->lastInsertId()]);
