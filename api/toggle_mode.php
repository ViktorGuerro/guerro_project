<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$mode = post_string('mode');
if (!in_array($mode, ['prep', 'map'], true)) {
    api_error('invalid_mode');
}

$stmt = $pdo->prepare('UPDATE game_state SET mode = :mode WHERE id = 1');
$stmt->execute(['mode' => $mode]);

api_ok(['mode' => $mode]);
