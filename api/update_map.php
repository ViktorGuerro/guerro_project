<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
$title = post_string('title');

if ($id === null) {
    api_error('id_required');
}
if ($title === null || trim($title) === '') {
    api_error('title_required');
}

$stmt = $pdo->prepare('UPDATE maps SET title = :title WHERE id = :id');
$stmt->execute([
    'id' => $id,
    'title' => trim($title),
]);

if ($stmt->rowCount() === 0) {
    api_error('map_not_found', 404);
}

api_ok();
