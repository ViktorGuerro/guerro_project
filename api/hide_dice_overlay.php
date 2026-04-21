<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$stmt = $pdo->prepare(
    'UPDATE dice_overlay_state
     SET entity_id = NULL,
         label = NULL,
         dice_type = NULL,
         dice_count = NULL,
         dice_values_json = NULL,
         modifier = 0,
         total_value = NULL,
         visible_until = NULL
     WHERE id = 1'
);
$stmt->execute();

api_ok();
