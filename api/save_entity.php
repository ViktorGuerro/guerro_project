<?php

declare(strict_types=1);

require __DIR__ . '/../inc/db.php';
require __DIR__ . '/../inc/helpers.php';
$config = require __DIR__ . '/../inc/config.php';

$id = post_int('id');
$name = post_string('name');
$side = post_string('side');
$armorClass = post_int('armor_class');
$hpCurrent = post_int('hp_current');
$hpMax = post_int('hp_max');
$sortOrder = post_int('sort_order', 0) ?? 0;
$isVisible = post_int('is_visible', 1) ?? 1;
$isUnconscious = post_int('is_unconscious', 0) ?? 0;

if ($name === null) {
    api_error('name_required');
}
if (!in_array($side, ['hero', 'enemy', 'boss', 'npc'], true)) {
    api_error('invalid_side');
}

$imagePath = null;
if (isset($_FILES['entity_file']) && $_FILES['entity_file']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['entity_file'];
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!isset($allowed[$mime])) {
        api_error('invalid_file_type');
    }

    ensure_dir($config['app']['uploads_tokens_dir']);
    $safe = normalize_file_name(pathinfo((string) $file['name'], PATHINFO_FILENAME));
    $fileName = sprintf('%s_%s.%s', $safe, bin2hex(random_bytes(6)), $allowed[$mime]);
    $targetPath = rtrim($config['app']['uploads_tokens_dir'], '/') . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        api_error('file_save_failed', 500);
    }

    $imagePath = rtrim($config['app']['uploads_tokens_url'], '/') . '/' . $fileName;
}

if ($id !== null) {
    $exists = $pdo->prepare('SELECT id, image_path FROM entities WHERE id = :id');
    $exists->execute(['id' => $id]);
    $current = $exists->fetch();
    if (!$current) {
        api_error('entity_not_found', 404);
    }

    $stmt = $pdo->prepare(
        'UPDATE entities
         SET name = :name, side = :side, image_path = :image_path, armor_class = :armor_class,
             hp_current = :hp_current, hp_max = :hp_max, sort_order = :sort_order, is_visible = :is_visible, is_unconscious = :is_unconscious
         WHERE id = :id'
    );

    $stmt->execute([
        'id' => $id,
        'name' => $name,
        'side' => $side,
        'image_path' => $imagePath ?? $current['image_path'],
        'armor_class' => $armorClass,
        'hp_current' => $hpCurrent,
        'hp_max' => $hpMax,
        'sort_order' => $sortOrder,
        'is_visible' => $isVisible ? 1 : 0,
        'is_unconscious' => $isUnconscious ? 1 : 0,
    ]);
} else {
    $stmt = $pdo->prepare(
        'INSERT INTO entities (name, side, image_path, armor_class, hp_current, hp_max, sort_order, is_visible, is_unconscious)
         VALUES (:name, :side, :image_path, :armor_class, :hp_current, :hp_max, :sort_order, :is_visible, :is_unconscious)'
    );
    $stmt->execute([
        'name' => $name,
        'side' => $side,
        'image_path' => $imagePath,
        'armor_class' => $armorClass,
        'hp_current' => $hpCurrent,
        'hp_max' => $hpMax,
        'sort_order' => $sortOrder,
        'is_visible' => $isVisible ? 1 : 0,
        'is_unconscious' => $isUnconscious ? 1 : 0,
    ]);
    $id = (int) $pdo->lastInsertId();
}

api_ok(['id' => $id]);
