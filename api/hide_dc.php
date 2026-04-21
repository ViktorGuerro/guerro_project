<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$pdo->prepare('UPDATE dc_state SET dc_value = NULL, visible_until = NULL WHERE id = 1')->execute();
api_ok();
