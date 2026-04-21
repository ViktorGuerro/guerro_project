<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$dcValue = post_int('dc_value');
if ($dcValue === null || $dcValue < 1 || $dcValue > 99) {
    api_error('invalid_dc_value');
}

$stmt = $pdo->prepare('UPDATE dc_state SET dc_value = :dc, visible_until = DATE_ADD(NOW(), INTERVAL 30 SECOND) WHERE id = 1');
$stmt->execute(['dc' => $dcValue]);

api_ok();
