<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
if ($id === null) {
    api_error('id_required');
}

$updateEntity = $pdo->prepare('UPDATE entities SET is_visible = 0 WHERE id = :id');
$updateEntity->execute(['id' => $id]);

$updateIcons = $pdo->prepare('UPDATE map_icons SET is_visible = 0 WHERE entity_id = :id');
$updateIcons->execute(['id' => $id]);

api_ok(['id' => $id]);
