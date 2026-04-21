<?php

declare(strict_types=1);

$config = require __DIR__ . '/../inc/config.php';

$db = $config['db'];

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    $db['host'],
    $db['port'],
    $db['dbname'],
    $db['charset']
);

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $db['user'], $db['pass'], $options);
} catch (Throwable $e) {
    fwrite(STDERR, "DB connection error: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

$migrationsDir = realpath(__DIR__ . '/../sql/migrations');
if ($migrationsDir === false || !is_dir($migrationsDir)) {
    fwrite(STDERR, "Migrations directory not found: sql/migrations" . PHP_EOL);
    exit(1);
}

$schemaMigrationBootstrap = <<<SQL
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)
SQL;

try {
    $pdo->exec($schemaMigrationBootstrap);
} catch (Throwable $e) {
    fwrite(STDERR, "Failed to ensure schema_migrations table: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

$files = glob($migrationsDir . '/*.sql');
if ($files === false) {
    fwrite(STDERR, "Failed to read migrations directory." . PHP_EOL);
    exit(1);
}

sort($files, SORT_NATURAL);

if ($files === []) {
    fwrite(STDOUT, "No migration files found." . PHP_EOL);
    exit(0);
}

$stmt = $pdo->query('SELECT migration_name FROM schema_migrations');
$applied = [];
foreach ($stmt->fetchAll() as $row) {
    $applied[$row['migration_name']] = true;
}

$appliedCount = 0;
$skippedCount = 0;

foreach ($files as $filePath) {
    $migrationName = basename($filePath);

    if (isset($applied[$migrationName])) {
        fwrite(STDOUT, "[SKIP] {$migrationName}" . PHP_EOL);
        $skippedCount++;
        continue;
    }

    $sql = file_get_contents($filePath);
    if ($sql === false) {
        fwrite(STDERR, "[FAIL] {$migrationName}: unable to read file" . PHP_EOL);
        exit(1);
    }

    fwrite(STDOUT, "[RUN ] {$migrationName}" . PHP_EOL);

    try {
        $pdo->exec($sql);

        fwrite(STDOUT, "[OK  ] {$migrationName}" . PHP_EOL);
        $appliedCount++;
    } catch (Throwable $e) {
        fwrite(STDERR, "[FAIL] {$migrationName}: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

fwrite(
    STDOUT,
    PHP_EOL . "Done. Applied: {$appliedCount}, skipped: {$skippedCount}" . PHP_EOL
);