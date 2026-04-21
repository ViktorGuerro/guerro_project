<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';
$config = require __DIR__ . '/../inc/config.php';

$id = post_int('id');
if ($id === null) {
    api_error('id_required');
}

$stmt = $pdo->prepare('SELECT id, file_path FROM maps WHERE id = :id');
$stmt->execute(['id' => $id]);
$map = $stmt->fetch();
if (!$map) {
    api_error('map_not_found', 404);
}

$pdo->prepare('DELETE FROM maps WHERE id = :id')->execute(['id' => $id]);
$pdo->prepare('UPDATE game_state SET active_map_id = NULL WHERE id = 1 AND active_map_id = :id')->execute(['id' => $id]);

$baseUrl = rtrim($config['app']['uploads_maps_url'], '/');
$filePath = (string) $map['file_path'];
if (str_starts_with($filePath, $baseUrl . '/')) {
    $relative = substr($filePath, strlen($baseUrl) + 1);
    $fullPath = rtrim($config['app']['uploads_maps_dir'], '/') . '/' . $relative;
    if (is_file($fullPath)) {
        @unlink($fullPath);
    }
}

api_ok();
