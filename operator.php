<?php declare(strict_types=1); ?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DnD Operator</title>
    <link rel="stylesheet" href="/assets/css/common.css">
    <link rel="stylesheet" href="/assets/css/operator.css">
</head>
<body>
<main class="operator-page">
    <section class="panel operator-panel">
        <header class="operator-header">
            <h1>Оператор</h1>
            <p>Сложность броска</p>
        </header>

        <div class="quick-dc" id="quick-dc-grid" aria-label="Быстрый выбор сложности"></div>

        <form id="operator-dc-form" class="operator-manual-form">
            <label for="operator-dc-input" class="field-label">Сложность</label>
            <input id="operator-dc-input" name="dc_value" type="number" min="1" max="99" inputmode="numeric" placeholder="1-99" required>
            <div class="operator-actions">
                <button id="operator-show-btn" type="submit" class="primary">Показать</button>
                <button id="operator-hide-btn" type="button" class="secondary">Скрыть</button>
            </div>
        </form>

        <div id="operator-status" class="operator-status" role="status" aria-live="polite">СЛ скрыта</div>
        <div id="operator-error" class="operator-error hidden" role="alert"></div>
    </section>
</main>

<script src="/assets/js/common.js"></script>
<script src="/assets/js/operator.js"></script>
</body>
</html>
