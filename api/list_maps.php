<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$maps = $pdo->query('SELECT id, title, file_path, uploaded_at, is_active FROM maps ORDER BY uploaded_at DESC, id DESC')->fetchAll();
$maps = array_map(static function (array $row): array {
    $row['id'] = (int) $row['id'];
    $row['is_active'] = (int) $row['is_active'];
    return $row;
}, $maps);

api_ok(['maps' => $maps]);
