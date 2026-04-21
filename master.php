<?php declare(strict_types=1); ?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DnD Master</title>
    <link rel="stylesheet" href="/assets/css/common.css">
    <link rel="stylesheet" href="/assets/css/master.css">
</head>
<body>
<div class="master-layout">
    <div class="master-controls">
        <div class="panel">
            <h3>Режим сцены</h3>
            <div class="form-row">
                <button id="btn-mode-prep" type="button">Подготовка сцены</button>
                <button id="btn-mode-map" type="button">Показать карту</button>
            </div>
        </div>

        <div class="panel">
            <h3>Карты</h3>
            <form id="map-upload-form" enctype="multipart/form-data">
                <div class="form-row">
                    <div class="form-field">
                        <label for="map-title" class="field-label">Название карты</label>
                        <input id="map-title" type="text" name="title" placeholder="Название карты" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="map-file" class="field-label">Файл карты</label>
                        <input id="map-file" type="file" name="map_file" accept=".jpg,.jpeg,.png,.webp" required>
                    </div>
                </div>
                <div class="form-row"><button type="submit">Загрузить</button></div>
            </form>
            <div id="map-list"></div>
        </div>

        <div class="panel">
            <h3>Сетка</h3>
            <form id="grid-form">
                <div class="form-row">
                    <label><input id="grid-enabled" name="grid_enabled" type="checkbox" checked> Показывать сетку</label>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="grid-cell-size" class="field-label">Размер ячейки, px</label>
                        <input id="grid-cell-size" name="grid_cell_size" type="number" min="20" max="300" value="70" placeholder="Размер клетки, px">
                    </div>
                </div>
                <div class="form-row"><button type="submit">Применить</button></div>
            </form>
        </div>

        <div class="panel">
            <h3>Сложность</h3>
            <form id="dc-show-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="dc-input" class="field-label">Сложность</label>
                        <input id="dc-input" name="dc_value" type="number" min="1" max="99" placeholder="1-99" required>
                    </div>
                </div>
                <div class="form-row"><button type="submit">Показать</button><button type="button" id="btn-hide-dc" class="secondary">Скрыть</button></div>
            </form>
        </div>

        <div class="panel">
            <h3>Боевой overlay</h3>
            <form id="battle-overlay-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="battle-attacker-entity" class="field-label">Кто атакует</label>
                        <select id="battle-attacker-entity"></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="battle-target-entity" class="field-label">Кого атакуют</label>
                        <select id="battle-target-entity"></select>
                    </div>
                </div>
                <div class="form-row">
                    <button type="submit">Показать бой</button>
                    <button type="button" id="btn-hide-battle-overlay" class="secondary">Скрыть бой</button>
                </div>
            </form>
        </div>


        <div class="panel">
            <h3>Бросок костей</h3>
            <form id="dice-overlay-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="dice-entity" class="field-label">Кто бросает</label>
                        <select id="dice-entity"></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="dice-label" class="field-label">Подпись броска</label>
                        <input id="dice-label" type="text" placeholder="Атака / Урон / Спасбросок">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="dice-type" class="field-label">Тип куба</label>
                        <select id="dice-type">
                            <option value="d4">d4</option>
                            <option value="d6" selected>d6</option>
                            <option value="d8">d8</option>
                            <option value="d10">d10</option>
                            <option value="d12">d12</option>
                            <option value="d20">d20</option>
                        </select>
                    </div>
                    <div class="form-field">
                        <label for="dice-count" class="field-label">Количество</label>
                        <input id="dice-count" type="number" min="1" max="20" value="1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label class="field-label">Значения кубов</label>
                        <div id="dice-values-fields" class="dice-values-fields"></div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="dice-modifier" class="field-label">Модификатор</label>
                        <input id="dice-modifier" type="number" value="0">
                    </div>
                    <div class="form-field">
                        <label for="dice-total" class="field-label">Итог</label>
                        <input id="dice-total" type="text" value="0" readonly>
                    </div>
                </div>
                <div class="form-row">
                    <button type="submit">Показать бросок</button>
                    <button id="btn-hide-dice-overlay" type="button" class="secondary">Скрыть бросок</button>
                </div>
            </form>
        </div>

        <div class="panel">
            <h3>Герои и враги</h3>
            <form id="entity-form" enctype="multipart/form-data">
                <input type="hidden" id="entity-id" name="id" value="">
                <div class="form-row">
                    <div class="form-field">
                        <label for="entity-name" class="field-label">Имя</label>
                        <input id="entity-name" name="name" placeholder="Имя" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="entity-side" class="field-label">Сторона</label>
                        <select id="entity-side" name="side"><option value="hero">Герой</option><option value="enemy">Враг</option><option value="boss">Босс</option><option value="npc">Нейтрал</option></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="entity-file" class="field-label">Миниатюра</label>
                        <input id="entity-file" type="file" name="entity_file" accept=".jpg,.jpeg,.png,.webp">
                    </div>
                </div>
                <div class="form-row form-row-split">
                    <div class="form-field">
                        <label for="entity-ac" class="field-label">Класс доспеха</label>
                        <input id="entity-ac" name="armor_class" type="number" placeholder="КД">
                    </div>
                    <div class="inline-adjust"><button type="button" class="quick-adjust" data-target="entity-ac" data-delta="-1">-1</button><button type="button" class="quick-adjust" data-target="entity-ac" data-delta="1">+1</button></div>
                </div>
                <div class="form-row form-row-split">
                    <div class="form-field">
                        <label for="entity-hp-current" class="field-label">Хиты текущие</label>
                        <input id="entity-hp-current" name="hp_current" type="number" placeholder="ХП текущие">
                    </div>
                    <div class="inline-adjust"><button type="button" class="quick-adjust" data-target="entity-hp-current" data-delta="-5">-5</button><button type="button" class="quick-adjust" data-target="entity-hp-current" data-delta="-1">-1</button><button type="button" class="quick-adjust" data-target="entity-hp-current" data-delta="1">+1</button><button type="button" class="quick-adjust" data-target="entity-hp-current" data-delta="5">+5</button></div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="entity-hp-max" class="field-label">Хиты максимум</label>
                        <input id="entity-hp-max" name="hp_max" type="number" placeholder="ХП максимум">
                    </div>
                    <div class="form-field">
                        <label for="entity-sort" class="field-label">Порядок</label>
                        <input id="entity-sort" name="sort_order" type="number" value="0" placeholder="Порядок">
                    </div>
                </div>
                <div class="form-row"><label><input id="entity-visible" type="checkbox" name="is_visible" value="1" checked> Видимость</label></div>
                <div class="form-row">
                    <button id="entity-submit" type="submit">Сохранить сущность</button>
                    <button id="entity-cancel" class="secondary hidden" type="button">Отмена редактирования</button>
                </div>
            </form>
            <div id="entity-list"></div>
        </div>

        <div class="panel">
            <h3>Добавление иконки</h3>
            <form id="add-icon-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="add-icon-entity" class="field-label">Сущность</label>
                        <select id="add-icon-entity"></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="add-icon-grid-x" class="field-label">Позиция X</label>
                        <input id="add-icon-grid-x" type="number" min="0" value="0" placeholder="grid_x">
                    </div>
                    <div class="form-field">
                        <label for="add-icon-grid-y" class="field-label">Позиция Y</label>
                        <input id="add-icon-grid-y" type="number" min="0" value="0" placeholder="grid_y">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="add-icon-size-cells" class="field-label">Размер, клеток</label>
                        <input id="add-icon-size-cells" type="number" min="1" max="4" value="1" placeholder="size_cells">
                    </div>
                </div>
                <div class="form-row"><button type="submit">Добавить на карту</button></div>
            </form>
        </div>

        <div id="selected-icon-panel" class="panel hidden">
            <h3>Выбранная иконка</h3>
            <div id="selected-icon-meta" class="selected-icon-meta">Не выбрана</div>
            <div class="form-row">
                <button id="movement-mode-toggle" type="button" class="secondary">Режим перемещения: выкл</button>
            </div>
            <div class="form-row">
                <label><input id="movement-debug-toggle" type="checkbox"> Подписи клеток (debug)</label>
            </div>
            <div class="icon-quick-controls">
                <div class="icon-quick-title">Перемещение</div>
                <div class="move-pad">
                    <button type="button" class="icon-step" data-dir="up">↑</button>
                    <button type="button" class="icon-step" data-dir="left">←</button>
                    <button type="button" class="icon-step" data-dir="down">↓</button>
                    <button type="button" class="icon-step" data-dir="right">→</button>
                </div>
                <div class="icon-quick-title">Размер</div>
                <div class="size-pad">
                    <button type="button" class="icon-size-step" data-delta="-1">-</button>
                    <button type="button" class="icon-size-step" data-delta="1">+</button>
                </div>
            </div>
            <form id="selected-icon-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="selected-icon-grid-x" class="field-label">Позиция X</label>
                        <input id="selected-icon-grid-x" type="number" min="0" placeholder="grid_x">
                    </div>
                    <div class="form-field">
                        <label for="selected-icon-grid-y" class="field-label">Позиция Y</label>
                        <input id="selected-icon-grid-y" type="number" min="0" placeholder="grid_y">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-field">
                        <label for="selected-icon-size-cells" class="field-label">Размер, клеток</label>
                        <input id="selected-icon-size-cells" type="number" min="1" max="4" placeholder="size_cells">
                    </div>
                </div>
                <div class="form-row">
                    <button id="selected-icon-center" type="button" class="secondary">Расположить по центру</button>
                </div>
                <div class="form-row form-row-split">
                    <div class="form-field">
                        <label for="selected-icon-range" class="field-label">Дальность, клеток</label>
                        <input id="selected-icon-range" type="number" min="1" max="100" value="6" placeholder="range_cells">
                    </div>
                </div>
                <div class="form-row">
                    <button id="selected-icon-show-range" type="button">Показать дальность</button>
                    <button id="selected-icon-hide-range" type="button" class="secondary">Скрыть дальность</button>
                </div>
                <div class="form-row">
                    <button type="submit">Сохранить</button>
                    <button id="selected-icon-delete" type="button" class="danger">Удалить иконку</button>
                </div>
            </form>
        </div>

        <div class="panel">
            <h3>Иконки на сцене</h3>
            <div id="scene-icons-list" class="scene-icons-list"></div>
        </div>

        <div class="panel">
            <h3>Диагностика сцены</h3>
            <div class="form-row">
                <label><input id="scene-debug-toggle" type="checkbox"> Диагностика сцены</label>
            </div>
            <div id="scene-debug-info" class="scene-debug-info">Debug выключен</div>
        </div>

        <div class="panel">
            <h3>Заметки мастера</h3>
            <div class="form-field">
                <label for="notes" class="field-label">Заметки</label>
                <textarea id="notes" placeholder="Только локально в браузере"></textarea>
            </div>
        </div>
    </div>

    <div class="map-stage" id="master-map-stage">
        <div class="scene-layer" id="master-scene-layer">
            <img id="master-map-image" class="map-image" src="" alt="map">
            <div id="master-grid-layer" class="grid-layer"></div>
            <div id="master-ability-overlay-layer" class="ability-overlay-layer"></div>
            <div id="master-movement-overlay-layer" class="movement-overlay-layer"></div>
            <div id="master-hover-overlay-layer" class="hover-overlay-layer"></div>
            <div id="master-icons-layer" class="icons-layer"></div>
            <div id="master-debug-layer" class="debug-layer hidden"></div>
        </div>
    </div>
</div>
<script src="/assets/js/common.js"></script>
<script src="/assets/js/master.js"></script>
</body>
</html>
