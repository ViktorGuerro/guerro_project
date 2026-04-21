<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$entityId = post_int('entity_id');
if ($entityId === null) {
    api_error('entity_id_required');
}

$entityStmt = $pdo->prepare('SELECT id FROM entities WHERE id = :id');
$entityStmt->execute(['id' => $entityId]);
if (!$entityStmt->fetch()) {
    api_error('entity_not_found', 404);
}

$stateStmt = $pdo->query(
    'SELECT gs.grid_cell_size, m.file_path
     FROM game_state gs
     LEFT JOIN maps m ON m.id = gs.active_map_id
     WHERE gs.id = 1'
);
$state = $stateStmt->fetch();

$gridCellSize = max(1, (int) ($state['grid_cell_size'] ?? 70));
$sceneWidth = 1920;
$sceneHeight = 1080;

if (!empty($state['file_path'])) {
    $absolutePath = realpath(__DIR__ . '/..' . $state['file_path']);
    if ($absolutePath !== false) {
        $imageSize = @getimagesize($absolutePath);
        if (is_array($imageSize) && isset($imageSize[0], $imageSize[1])) {
            $sceneWidth = max(1, (int) $imageSize[0]);
            $sceneHeight = max(1, (int) $imageSize[1]);
        }
    }
}

$sceneCols = max(1, (int) floor($sceneWidth / $gridCellSize));
$sceneRows = max(1, (int) floor($sceneHeight / $gridCellSize));
$centerX = (int) floor($sceneCols / 2);
$centerY = (int) floor($sceneRows / 2);

$insert = $pdo->prepare('INSERT INTO map_icons (entity_id, grid_x, grid_y, size_cells) VALUES (:entity_id, :grid_x, :grid_y, 1)');
$insert->execute([
    'entity_id' => $entityId,
    'grid_x' => $centerX,
    'grid_y' => $centerY,
]);

api_ok([
    'id' => (int) $pdo->lastInsertId(),
    'grid_x' => $centerX,
    'grid_y' => $centerY,
    'size_cells' => 1,
]);
