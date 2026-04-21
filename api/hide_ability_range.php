<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$update = $pdo->prepare('UPDATE ability_overlay_state SET icon_id = NULL, visible_until = NULL WHERE id = 1');
$update->execute();

api_ok();
