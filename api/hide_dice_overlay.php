<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$update = $pdo->prepare(
    "UPDATE dice_overlay_state
     SET entity_id = NULL,
         label = NULL,
         roll_mode = 'normal',
         dice_groups_json = NULL,
         advantage_values_json = NULL,
         selected_roll = NULL,
         dice_type = NULL,
         dice_count = NULL,
         dice_values_json = NULL,
         modifier = 0,
         total_value = NULL,
         visible_until = NULL
     WHERE id = 1"
);
$update->execute();

api_ok();
