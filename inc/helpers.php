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
