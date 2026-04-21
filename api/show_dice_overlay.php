<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

const ALLOWED_DICE_TYPES = [
    'd4' => 4,
    'd6' => 6,
    'd8' => 8,
    'd10' => 10,
    'd12' => 12,
    'd20' => 20,
];

$entityId = post_int('entity_id');
$label = post_string('label');
$diceType = post_string('dice_type');
$diceCount = post_int('dice_count');
$modifier = post_int('modifier', 0) ?? 0;

if ($diceType === null || !array_key_exists($diceType, ALLOWED_DICE_TYPES)) {
    api_error('invalid_dice_type');
}

if ($diceCount === null || $diceCount < 1) {
    api_error('invalid_dice_count');
}

$rawDiceValues = $_POST['dice_values'] ?? null;
if (!is_array($rawDiceValues)) {
    api_error('dice_values_required');
}

if (count($rawDiceValues) !== $diceCount) {
    api_error('dice_values_count_mismatch');
}

$maxValue = ALLOWED_DICE_TYPES[$diceType];
$diceValues = [];
foreach ($rawDiceValues as $rawValue) {
    $value = filter_var($rawValue, FILTER_VALIDATE_INT);
    if ($value === false || $value < 1 || $value > $maxValue) {
        api_error('dice_value_out_of_range');
    }
    $diceValues[] = (int) $value;
}

if ($entityId !== null) {
    $check = $pdo->prepare('SELECT id FROM entities WHERE id = :id');
    $check->execute(['id' => $entityId]);
    if (!$check->fetch()) {
        api_error('entity_not_found', 404);
    }
}

$totalValue = array_sum($diceValues) + $modifier;

$update = $pdo->prepare(
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
$update->execute([
    'entity_id' => $entityId,
    'label' => $label,
    'dice_type' => $diceType,
    'dice_count' => $diceCount,
    'dice_values_json' => json_encode($diceValues, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'modifier' => $modifier,
    'total_value' => $totalValue,
]);

api_ok([
    'entity_id' => $entityId,
    'label' => $label,
    'dice_type' => $diceType,
    'dice_count' => $diceCount,
    'dice_values' => $diceValues,
    'modifier' => $modifier,
    'total_value' => $totalValue,
]);
