<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$update = $pdo->prepare(
    'UPDATE battle_overlay_state
     SET attacker_entity_id = NULL,
         target_entity_id = NULL,
         visible_until = NULL
     WHERE id = 1'
);
$update->execute();

api_ok();
