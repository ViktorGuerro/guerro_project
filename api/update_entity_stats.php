<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
$deltaHp = post_int('delta_hp');
$deltaAc = post_int('delta_ac');

if ($id === null) {
    api_error('id_required');
}
if ($deltaHp === null && $deltaAc === null) {
    api_error('delta_required');
}

$stmt = $pdo->prepare('SELECT id, armor_class, hp_current, hp_max FROM entities WHERE id = :id');
$stmt->execute(['id' => $id]);
$entity = $stmt->fetch();
if (!$entity) {
    api_error('entity_not_found', 404);
}

$nextHp = $entity['hp_current'] !== null ? (int) $entity['hp_current'] : null;
$nextAc = $entity['armor_class'] !== null ? (int) $entity['armor_class'] : null;

if ($deltaHp !== null) {
    $nextHp = max(0, (int) ($nextHp ?? 0) + $deltaHp);
}
if ($deltaAc !== null) {
    $nextAc = max(0, (int) ($nextAc ?? 0) + $deltaAc);
}

$update = $pdo->prepare('UPDATE entities SET hp_current = :hp_current, armor_class = :armor_class WHERE id = :id');
$update->execute([
    'id' => $id,
    'hp_current' => $nextHp,
    'armor_class' => $nextAc,
]);

api_ok([
    'id' => $id,
    'hp_current' => $nextHp,
    'hp_max' => $entity['hp_max'] !== null ? (int) $entity['hp_max'] : null,
    'armor_class' => $nextAc,
]);
