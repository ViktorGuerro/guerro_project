<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';
$config = require __DIR__ . '/../inc/config.php';

$title = post_string('title');
if ($title === null) {
    api_error('title_required');
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
$stmt = $pdo->prepare('INSERT INTO maps (title, file_path, original_name) VALUES (:title, :file_path, :original_name)');
$stmt->execute([
    'title' => $title,
    'file_path' => $filePath,
    'original_name' => $file['name'],
]);

$id = (int) $pdo->lastInsertId();
api_ok(['map' => ['id' => $id, 'title' => $title, 'file_path' => $filePath]]);
