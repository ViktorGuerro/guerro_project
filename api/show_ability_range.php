<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$iconId = post_int('icon_id');
$rangeCells = post_int('range_cells');

if ($iconId === null) {
    api_error('icon_id_required');
}
if ($rangeCells === null) {
    api_error('range_cells_required');
}
if ($rangeCells < 1 || $rangeCells > 100) {
    api_error('invalid_range_cells');
}

$check = $pdo->prepare('SELECT id FROM map_icons WHERE id = :id');
$check->execute(['id' => $iconId]);
if (!$check->fetch()) {
    api_error('icon_not_found', 404);
}

$update = $pdo->prepare('UPDATE ability_overlay_state SET icon_id = :icon_id, range_cells = :range_cells, visible_until = DATE_ADD(NOW(), INTERVAL 10 SECOND) WHERE id = 1');
$update->execute([
    'icon_id' => $iconId,
    'range_cells' => $rangeCells,
]);

api_ok([
    'icon_id' => $iconId,
    'range_cells' => $rangeCells,
]);
