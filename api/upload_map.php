<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';
$config = require __DIR__ . '/../inc/config.php';

$title = post_string('title');
$gridCols = post_int('grid_cols', 32) ?? 32;
$gridRows = post_int('grid_rows', 18) ?? 18;
if ($title === null) {
    api_error('title_required');
}
if ($gridCols < 1 || $gridCols > 500) {
    api_error('invalid_grid_cols');
}
if ($gridRows < 1 || $gridRows > 500) {
    api_error('invalid_grid_rows');
}
if (!isset($_FILES['map_file']) || $_FILES['map_file']['error'] !== UPLOAD_ERR_OK) {
    api_error('file_required');
}

$file = $_FILES['map_file'];
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!isset($allowed[$mime])) {
    api_error('invalid_file_type');
}

ensure_dir($config['app']['uploads_maps_dir']);
$ext = $allowed[$mime];
$safe = normalize_file_name(pathinfo((string) $file['name'], PATHINFO_FILENAME));
$fileName = sprintf('%s_%s.%s', $safe, bin2hex(random_bytes(6)), $ext);
$targetPath = rtrim($config['app']['uploads_maps_dir'], '/') . '/' . $fileName;
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    api_error('file_save_failed', 500);
}

$filePath = rtrim($config['app']['uploads_maps_url'], '/') . '/' . $fileName;
$hasMapGridColumns = map_grid_columns_available($pdo);
if ($hasMapGridColumns) {
    $stmt = $pdo->prepare('INSERT INTO maps (title, file_path, original_name, grid_cols, grid_rows) VALUES (:title, :file_path, :original_name, :grid_cols, :grid_rows)');
    $stmt->execute([
        'title' => $title,
        'file_path' => $filePath,
        'original_name' => $file['name'],
        'grid_cols' => $gridCols,
        'grid_rows' => $gridRows,
    ]);
} else {
    $stmt = $pdo->prepare('INSERT INTO maps (title, file_path, original_name) VALUES (:title, :file_path, :original_name)');
    $stmt->execute([
        'title' => $title,
        'file_path' => $filePath,
        'original_name' => $file['name'],
    ]);
}

$id = (int) $pdo->lastInsertId();
api_ok(['map' => ['id' => $id, 'title' => $title, 'file_path' => $filePath, 'grid_cols' => $gridCols, 'grid_rows' => $gridRows]]);
