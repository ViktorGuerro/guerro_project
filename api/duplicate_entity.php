<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';

$id = post_int('id');
if ($id === null) {
    api_error('id_required');
}

$stmt = $pdo->prepare('SELECT name, side, image_path, armor_class, hp_current, hp_max, sort_order, is_visible FROM entities WHERE id = :id');
$stmt->execute(['id' => $id]);
$entity = $stmt->fetch();
if (!$entity) {
    api_error('entity_not_found', 404);
}

$name = trim((string) $entity['name']);
if (preg_match('/^(.*?)(\d+)\s*$/u', $name, $matches) === 1) {
    $prefix = rtrim((string) $matches[1]);
    $number = (int) $matches[2] + 1;
    $newName = trim($prefix . ' ' . $number);
} else {
    $newName = trim($name . ' 2');
}

$insert = $pdo->prepare(
    'INSERT INTO entities (name, side, image_path, armor_class, hp_current, hp_max, sort_order, is_visible)
     VALUES (:name, :side, :image_path, :armor_class, :hp_current, :hp_max, :sort_order, :is_visible)'
);
$insert->execute([
    'name' => $newName,
    'side' => $entity['side'],
    'image_path' => $entity['image_path'],
    'armor_class' => $entity['armor_class'],
    'hp_current' => $entity['hp_current'],
    'hp_max' => $entity['hp_max'],
    'sort_order' => $entity['sort_order'],
    'is_visible' => $entity['is_visible'],
]);
$newId = (int) $pdo->lastInsertId();

$fetchNew = $pdo->prepare('SELECT id, name, side, image_path, armor_class, hp_current, hp_max, sort_order, is_visible FROM entities WHERE id = :id');
$fetchNew->execute(['id' => $newId]);
$newEntity = $fetchNew->fetch();

api_ok([
    'entity' => [
        'id' => (int) $newEntity['id'],
        'name' => $newEntity['name'],
        'side' => $newEntity['side'],
        'image_path' => $newEntity['image_path'],
        'armor_class' => $newEntity['armor_class'] !== null ? (int) $newEntity['armor_class'] : null,
        'hp_current' => $newEntity['hp_current'] !== null ? (int) $newEntity['hp_current'] : null,
        'hp_max' => $newEntity['hp_max'] !== null ? (int) $newEntity['hp_max'] : null,
        'sort_order' => (int) $newEntity['sort_order'],
        'is_visible' => (int) $newEntity['is_visible'],
    ],
]);
