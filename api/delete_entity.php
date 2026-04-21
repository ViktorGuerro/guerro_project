<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
if ($id === null) {
    api_error('id_required');
}

$stmt = $pdo->prepare('DELETE FROM entities WHERE id = :id');
$stmt->execute(['id' => $id]);

api_ok();
