<?php

declare(strict_types=1);

return [
    'db' => [
        'host' => 'localhost',
        'port' => '3306',
        'dbname' => 'guerro_db',
        'user' => 'guerro_user',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'base_url' => '',
        'uploads_maps_dir' => __DIR__ . '/../uploads/maps/',
        'uploads_tokens_dir' => __DIR__ . '/../uploads/tokens/',
        'uploads_maps_url' => '/uploads/maps/',
        'uploads_tokens_url' => '/uploads/tokens/',
        'poll_interval_ms' => 700,
    ],
];
