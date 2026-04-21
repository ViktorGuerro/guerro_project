<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$attackerEntityId = post_int('attacker_entity_id');
$targetEntityId = post_int('target_entity_id');

if ($attackerEntityId === null) {
    api_error('attacker_entity_id_required');
}

if ($targetEntityId === null) {
    api_error('target_entity_id_required');
}

$check = $pdo->prepare('SELECT id FROM entities WHERE id = :id');

$check->execute(['id' => $attackerEntityId]);
if (!$check->fetch()) {
    api_error('attacker_entity_not_found', 404);
}

$check->execute(['id' => $targetEntityId]);
if (!$check->fetch()) {
    api_error('target_entity_not_found', 404);
}

$update = $pdo->prepare(
    'UPDATE battle_overlay_state
     SET attacker_entity_id = :attacker_entity_id,
         target_entity_id = :target_entity_id,
         visible_until = DATE_ADD(NOW(), INTERVAL 10 SECOND)
     WHERE id = 1'
);
$update->execute([
    'attacker_entity_id' => $attackerEntityId,
    'target_entity_id' => $targetEntityId,
]);

api_ok([
    'attacker_entity_id' => $attackerEntityId,
    'target_entity_id' => $targetEntityId,
]);
