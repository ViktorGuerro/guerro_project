<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$actionType = post_string('action_type', 'custom') ?? 'custom';
$targetEntityId = post_int('target_entity_id');

$diceRowStmt = $pdo->query('SELECT selected_roll, total_value FROM dice_overlay_state WHERE id = 1');
$diceRow = $diceRowStmt->fetch() ?: ['selected_roll' => null, 'total_value' => null];
$selectedD20 = $diceRow['selected_roll'] !== null ? (int) $diceRow['selected_roll'] : null;
$totalValue = $diceRow['total_value'] !== null ? (int) $diceRow['total_value'] : null;

if ($selectedD20 === null && $totalValue !== null) {
    $selectedD20 = $totalValue;
}

$targetArmorClass = null;
if ($targetEntityId !== null) {
    $targetStmt = $pdo->prepare('SELECT armor_class FROM entities WHERE id = :id');
    $targetStmt->execute(['id' => $targetEntityId]);
    $target = $targetStmt->fetch();
    if ($target) {
        $targetArmorClass = $target['armor_class'] !== null ? (int) $target['armor_class'] : null;
    }
}

$dcStmt = $pdo->query('SELECT dc_value, visible_until FROM dc_state WHERE id = 1');
$dc = $dcStmt->fetch() ?: ['dc_value' => null, 'visible_until' => null];
$dcVisible = $dc['visible_until'] !== null && strtotime((string) $dc['visible_until']) > time();
$dcValue = $dcVisible && $dc['dc_value'] !== null ? (int) $dc['dc_value'] : null;

$result = build_auto_roll_result($actionType, $selectedD20, $totalValue, $targetArmorClass, $dcValue);
if ($result === null) {
    api_error('not_enough_data_for_auto_result');
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
$update->execute($result);

api_ok($result);
