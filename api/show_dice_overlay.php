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

function normalize_groups(mixed $rawGroups): array
{
    if (!is_array($rawGroups) || count($rawGroups) < 1) {
        api_error('groups_required');
    }

    $groups = [];
    foreach ($rawGroups as $group) {
        if (!is_array($group)) {
            api_error('invalid_group_format');
        }

        $diceType = isset($group['dice_type']) ? trim((string) $group['dice_type']) : null;
        $diceCount = filter_var($group['dice_count'] ?? null, FILTER_VALIDATE_INT);
        $rawValues = $group['dice_values'] ?? null;

        if ($diceType === null || !array_key_exists($diceType, ALLOWED_DICE_TYPES)) {
            api_error('invalid_dice_type');
        }
        if ($diceCount === false || $diceCount < 1) {
            api_error('invalid_dice_count');
        }
        if (!is_array($rawValues) || count($rawValues) !== $diceCount) {
            api_error('dice_values_count_mismatch');
        }

        $maxValue = ALLOWED_DICE_TYPES[$diceType];
        $diceValues = [];
        foreach ($rawValues as $rawValue) {
            $value = filter_var($rawValue, FILTER_VALIDATE_INT);
            if ($value === false || $value < 1 || $value > $maxValue) {
                api_error('dice_value_out_of_range');
            }
            $diceValues[] = (int) $value;
        }

        $groups[] = [
            'dice_type' => $diceType,
            'dice_count' => (int) $diceCount,
            'dice_values' => $diceValues,
        ];
    }

    return $groups;
}

function detect_critical_state(array $groups): string
{
    $d20Groups = array_values(array_filter($groups, static fn (array $group): bool => $group['dice_type'] === 'd20'));
    if (count($d20Groups) !== 1) {
        return 'none';
    }

    $singleD20 = $d20Groups[0];
    if ($singleD20['dice_count'] !== 1 || count($singleD20['dice_values']) !== 1) {
        return 'none';
    }

    $value = $singleD20['dice_values'][0];
    if ($value === 20) {
        return 'success';
    }
    if ($value === 1) {
        return 'fail';
    }

    return 'none';
}

$entityId = post_int('entity_id');
$label = post_string('label');
$modifier = post_int('modifier', 0) ?? 0;

$rawGroups = $_POST['groups'] ?? null;
if (isset($_POST['groups_json'])) {
    $decodedGroups = json_decode((string) $_POST['groups_json'], true);
    if (is_array($decodedGroups)) {
        $rawGroups = $decodedGroups;
    }
}
$groups = normalize_groups($rawGroups);

if ($entityId !== null) {
    $check = $pdo->prepare('SELECT id FROM entities WHERE id = :id');
    $check->execute(['id' => $entityId]);
    if (!$check->fetch()) {
        api_error('entity_not_found', 404);
    }
}

$totalValue = array_reduce($groups, static function (int $sum, array $group): int {
    return $sum + array_sum($group['dice_values']);
}, 0) + $modifier;

$criticalState = detect_critical_state($groups);

$legacyType = $groups[0]['dice_type'] ?? null;
$legacyCount = $groups[0]['dice_count'] ?? null;
$legacyValues = $groups[0]['dice_values'] ?? null;

$update = $pdo->prepare(
    'UPDATE dice_overlay_state
     SET entity_id = :entity_id,
         label = :label,
         dice_groups_json = :dice_groups_json,
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
    'dice_groups_json' => json_encode($groups, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'dice_type' => $legacyType,
    'dice_count' => $legacyCount,
    'dice_values_json' => $legacyValues !== null ? json_encode($legacyValues, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
    'modifier' => $modifier,
    'total_value' => $totalValue,
]);

api_ok([
    'entity_id' => $entityId,
    'label' => $label,
    'groups' => $groups,
    'modifier' => $modifier,
    'total_value' => $totalValue,
    'critical_state' => $criticalState,
]);
