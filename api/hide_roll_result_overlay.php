<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$update = $pdo->prepare(
    'UPDATE roll_result_overlay_state
     SET result_type = NULL,
         title = NULL,
         subtitle = NULL,
         value_text = NULL,
         visible_until = NULL
     WHERE id = 1'
);
$update->execute();

api_ok();
