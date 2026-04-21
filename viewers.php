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
    <div class="controls-hotspot" aria-hidden="true"></div>
    <div class="top-controls"><button id="btn-refresh" class="secondary">Обновить</button><button id="btn-fullscreen">Fullscreen</button></div>
    <div id="dc-box" class="dc-box hidden">
        <img src="/assets/img/ui/shield.png" class="dc-shield" alt="">
        <div id="dc-value" class="dc-value"></div>
    </div>
    <div id="viewers-placeholder" class="placeholder">Подготовка сцены</div>
    <div id="battle-overlay" class="battle-overlay hidden">
        <div id="battle-overlay-attacker" class="battle-side battle-side-left hidden">
            <div class="battle-overlay-card">
                <div class="battle-overlay-portrait">
                    <img id="battle-overlay-attacker-image" src="" alt="">
                </div>
                <div class="battle-overlay-info">
                    <div id="battle-overlay-attacker-name" class="battle-overlay-name"></div>
                    <div class="battle-overlay-stats">
                        <div class="battle-stat">
                            <img src="/assets/img/ui/shield.png" alt="">
                            <span id="battle-overlay-attacker-ac"></span>
                        </div>
                        <div class="battle-stat">
                            <img src="/assets/img/ui/heart.png" alt="">
                            <span id="battle-overlay-attacker-hp"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="battle-overlay-target" class="battle-side battle-side-right hidden">
            <div class="battle-overlay-card">
                <div class="battle-overlay-portrait">
                    <img id="battle-overlay-target-image" src="" alt="">
                </div>
                <div class="battle-overlay-info">
                    <div id="battle-overlay-target-name" class="battle-overlay-name"></div>
                    <div class="battle-overlay-stats">
                        <div class="battle-stat">
                            <img src="/assets/img/ui/shield.png" alt="">
                            <span id="battle-overlay-target-ac"></span>
                        </div>
                        <div class="battle-stat">
                            <img src="/assets/img/ui/heart.png" alt="">
                            <span id="battle-overlay-target-hp"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div id="dice-overlay" class="dice-overlay hidden">
        <div class="dice-overlay-header">
            <div id="dice-overlay-actor" class="dice-overlay-actor"></div>
            <div id="dice-overlay-label" class="dice-overlay-label"></div>
        </div>
        <div id="dice-overlay-dice-list" class="dice-overlay-dice-list"></div>
        <div id="dice-overlay-summary" class="dice-overlay-summary"></div>
    </div>

    <div id="viewers-stage" class="screen-map-stage map-stage hidden">
        <div class="scene-layer" id="viewers-scene-layer">
            <img id="viewers-map-image" class="map-image" src="" alt="map">
            <div id="viewers-grid-layer" class="grid-layer"></div>
            <div id="viewers-ability-overlay-layer" class="ability-overlay-layer"></div>
            <div id="viewers-icons-layer" class="icons-layer"></div>
        </div>
    </div>
</div>
<script src="/assets/js/common.js"></script>
<script src="/assets/js/viewers.js"></script>
</body>
</html>
