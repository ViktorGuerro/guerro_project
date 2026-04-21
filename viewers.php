<?php declare(strict_types=1); ?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DnD Viewers</title>
    <link rel="stylesheet" href="/assets/css/common.css">
    <link rel="stylesheet" href="/assets/css/screen.css">
</head>
<body>
<div class="screen-wrap">
    <div class="top-controls"><button id="btn-refresh" class="secondary">Обновить</button><button id="btn-fullscreen">Fullscreen</button></div>
    <aside id="viewer-sidebar" class="viewer-sidebar"></aside>
    <div id="dc-box" class="dc-box hidden"></div>
    <div id="viewers-placeholder" class="placeholder">Подготовка сцены</div>
    <div id="viewers-stage" class="screen-map-stage map-stage hidden">
        <img id="viewers-map-image" class="map-image" src="" alt="map">
        <div id="viewers-grid-layer" class="grid-layer"></div>
        <div id="viewers-icons-layer" class="icons-layer"></div>
    </div>
</div>
<script src="/assets/js/common.js"></script>
<script src="/assets/js/viewers.js"></script>
</body>
</html>
