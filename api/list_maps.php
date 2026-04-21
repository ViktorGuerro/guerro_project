<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$hasMapGridColumns = map_grid_columns_available($pdo);
$sql = $hasMapGridColumns
    ? 'SELECT id, title, file_path, grid_cols, grid_rows, uploaded_at, is_active FROM maps ORDER BY uploaded_at DESC, id DESC'
    : 'SELECT id, title, file_path, uploaded_at, is_active FROM maps ORDER BY uploaded_at DESC, id DESC';
$maps = $pdo->query($sql)->fetchAll();
$maps = array_map(static function (array $row): array {
    $row['id'] = (int) $row['id'];
    $row['is_active'] = (int) $row['is_active'];
    $row['grid_cols'] = (int) ($row['grid_cols'] ?? 32);
    $row['grid_rows'] = (int) ($row['grid_rows'] ?? 18);
    return $row;
}, $maps);

api_ok(['maps' => $maps]);
