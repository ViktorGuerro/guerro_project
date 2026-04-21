<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$diceMaxByType = [
    'd4' => 4,
    'd6' => 6,
    'd8' => 8,
    'd10' => 10,
    'd12' => 12,
    'd20' => 20,
];

$entityIdRaw = post_int('entity_id');
$entityId = $entityIdRaw !== null && $entityIdRaw > 0 ? $entityIdRaw : null;
$label = post_string('label', '') ?? '';
$diceType = strtolower(post_string('dice_type', '') ?? '');
$diceCount = post_int('dice_count', 0) ?? 0;
$modifier = post_int('modifier', 0) ?? 0;
$diceValuesRaw = post_string('dice_values', '[]') ?? '[]';

if (!isset($diceMaxByType[$diceType])) {
    api_error('invalid_dice_type');
}
if ($diceCount < 1 || $diceCount > 20) {
    api_error('invalid_dice_count');
}

$diceValues = json_decode($diceValuesRaw, true);
if (!is_array($diceValues) || count($diceValues) !== $diceCount) {
    api_error('invalid_dice_values_count');
}

$maxValue = $diceMaxByType[$diceType];
$normalizedValues = [];
foreach ($diceValues as $value) {
    if (!is_int($value) && !(is_string($value) && preg_match('/^-?\d+$/', $value))) {
        api_error('invalid_dice_value');
    }
    $intValue = (int) $value;
    if ($intValue < 1 || $intValue > $maxValue) {
        api_error('dice_value_out_of_range');
    }
    $normalizedValues[] = $intValue;
}

if ($entityId !== null) {
    $entityStmt = $pdo->prepare("SELECT id FROM entities WHERE id = :id AND side IN ('hero', 'enemy', 'boss', 'npc') LIMIT 1");
    $entityStmt->execute(['id' => $entityId]);
    if (!$entityStmt->fetch()) {
        api_error('entity_not_found');
    }
}

$totalValue = array_sum($normalizedValues) + $modifier;

$stmt = $pdo->prepare(
    'UPDATE dice_overlay_state
     SET entity_id = :entity_id,
         label = :label,
         dice_type = :dice_type,
         dice_count = :dice_count,
         dice_values_json = :dice_values_json,
         modifier = :modifier,
         total_value = :total_value,
         visible_until = DATE_ADD(NOW(), INTERVAL 10 SECOND)
     WHERE id = 1'
);

$stmt->execute([
    'entity_id' => $entityId,
    'label' => $label !== '' ? $label : null,
    'dice_type' => $diceType,
    'dice_count' => $diceCount,
    'dice_values_json' => json_encode($normalizedValues, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'modifier' => $modifier,
    'total_value' => $totalValue,
]);

api_ok([
    'total_value' => $totalValue,
    'dice_values' => $normalizedValues,
]);
