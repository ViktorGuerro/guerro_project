<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
$title = post_string('title');
$gridCols = post_int('grid_cols');
$gridRows = post_int('grid_rows');

if ($id === null) {
    api_error('id_required');
}
if ($title !== null && trim($title) === '') {
    api_error('title_required');
}
if ($title === null && $gridCols === null && $gridRows === null) {
    api_error('nothing_to_update');
}
if ($gridCols !== null && $gridCols < 1) {
    api_error('invalid_grid_cols');
}
if ($gridRows !== null && $gridRows < 1) {
    api_error('invalid_grid_rows');
}

$sets = [];
$params = ['id' => $id];
if ($title !== null) {
    $sets[] = 'title = :title';
    $params['title'] = trim($title);
}
if ($gridCols !== null) {
    $sets[] = 'grid_cols = :grid_cols';
    $params['grid_cols'] = $gridCols;
}
if ($gridRows !== null) {
    $sets[] = 'grid_rows = :grid_rows';
    $params['grid_rows'] = $gridRows;
}

$stmt = $pdo->prepare('UPDATE maps SET ' . implode(', ', $sets) . ' WHERE id = :id');
$stmt->execute($params);

if ($stmt->rowCount() === 0) {
    $check = $pdo->prepare('SELECT id FROM maps WHERE id = :id');
    $check->execute(['id' => $id]);
    if (!$check->fetch()) {
        api_error('map_not_found', 404);
    }
}

api_ok();
