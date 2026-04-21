<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$resultType = post_string('result_type');
$title = post_string('title');
$subtitle = post_string('subtitle');
$valueText = post_string('value_text');

if ($resultType === null) {
    api_error('result_type_required');
}
if ($title === null) {
    api_error('title_required');
}

$update = $pdo->prepare(
    'UPDATE roll_result_overlay_state
     SET result_type = :result_type,
         title = :title,
         subtitle = :subtitle,
         value_text = :value_text,
         visible_until = DATE_ADD(NOW(), INTERVAL 10 SECOND)
     WHERE id = 1'
);
$update->execute([
    'result_type' => $resultType,
    'title' => $title,
    'subtitle' => $subtitle,
    'value_text' => $valueText,
]);

api_ok([
    'result_type' => $resultType,
    'title' => $title,
    'subtitle' => $subtitle,
    'value_text' => $valueText,
]);
