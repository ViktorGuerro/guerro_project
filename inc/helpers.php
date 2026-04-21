<?php

declare(strict_types=1);

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function post_string(string $key, ?string $default = null): ?string
{
    if (!isset($_POST[$key])) {
        return $default;
    }

    $value = trim((string) $_POST[$key]);

    return $value === '' ? $default : $value;
}

function post_int(string $key, ?int $default = null): ?int
{
    if (!isset($_POST[$key]) || $_POST[$key] === '') {
        return $default;
    }

    $value = filter_var($_POST[$key], FILTER_VALIDATE_INT);

    return $value === false ? $default : (int) $value;
}

function ensure_dir(string $path): void
{
    if (!is_dir($path) && !mkdir($path, 0775, true) && !is_dir($path)) {
        throw new RuntimeException('Failed to create directory: ' . $path);
    }
}

function normalize_file_name(string $name): string
{
    $name = preg_replace('/[^a-zA-Z0-9._-]+/', '_', $name) ?? 'file';
    $name = trim($name, '._-');

    return $name === '' ? 'file' : $name;
}

function api_error(string $error, int $code = 400): void
{
    json_response(['ok' => false, 'error' => $error], $code);
}

function api_ok(array $data = []): void
{
    json_response(['ok' => true, 'data' => $data]);
}


function build_auto_roll_result(string $actionType, ?int $selectedD20, ?int $totalValue, ?int $targetArmorClass, ?int $dcValue): ?array
{
    $normalizedActionType = in_array($actionType, ['attack', 'save', 'check', 'damage', 'custom'], true) ? $actionType : 'custom';

    if ($selectedD20 === null && $totalValue === null) {
        return null;
    }

    if ($normalizedActionType === 'attack') {
        if ($selectedD20 === 20) {
            return ['result_type' => 'crit_success', 'title' => 'Критический успех', 'subtitle' => 'Натуральная 20', 'value_text' => $totalValue !== null ? (string) $totalValue : null];
        }
        if ($selectedD20 === 1) {
            return ['result_type' => 'crit_fail', 'title' => 'Критический провал', 'subtitle' => 'Натуральная 1', 'value_text' => $totalValue !== null ? (string) $totalValue : null];
        }
        if ($targetArmorClass !== null && $totalValue !== null) {
            $hit = $totalValue >= $targetArmorClass;
            return [
                'result_type' => $hit ? 'hit' : 'miss',
                'title' => $hit ? 'Попадание' : 'Промах',
                'subtitle' => 'КД цели: ' . $targetArmorClass,
                'value_text' => (string) $totalValue,
            ];
        }
    }

    if ($normalizedActionType === 'save' && $dcValue !== null && $totalValue !== null) {
        $success = $totalValue >= $dcValue;
        return [
            'result_type' => $success ? 'save_success' : 'save_fail',
            'title' => $success ? 'Спасбросок пройден' : 'Спасбросок провален',
            'subtitle' => 'СЛ: ' . $dcValue,
            'value_text' => (string) $totalValue,
        ];
    }

    return null;
}
