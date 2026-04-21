<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$entityId = post_int('entity_id');
if ($entityId === null) {
    api_error('entity_id_required');
}

$check = $pdo->prepare('SELECT id FROM entities WHERE id = :id');
$check->execute(['id' => $entityId]);
if (!$check->fetch()) {
    api_error('entity_not_found', 404);
}

$update = $pdo->prepare('UPDATE battle_overlay_state SET entity_id = :entity_id, visible_until = DATE_ADD(NOW(), INTERVAL 10 SECOND) WHERE id = 1');
$update->execute(['entity_id' => $entityId]);

api_ok(['entity_id' => $entityId]);
