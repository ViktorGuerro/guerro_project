<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$entityId = post_int('entity_id');
if ($entityId === null) {
    api_error('entity_id_required');
}

$stmt = $pdo->prepare('DELETE FROM map_icons WHERE entity_id = :entity_id');
$stmt->execute(['entity_id' => $entityId]);

api_ok(['entity_id' => $entityId]);
