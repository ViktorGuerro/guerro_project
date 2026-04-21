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
                <div class="form-row"><input type="text" name="title" placeholder="Название карты" required></div>
                <div class="form-row"><input type="file" name="map_file" accept=".jpg,.jpeg,.png,.webp" required></div>
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
                <div class="form-row"><input id="grid-cell-size" name="grid_cell_size" type="number" min="20" max="300" value="70" placeholder="Размер клетки, px"></div>
                <div class="form-row"><button type="submit">Применить</button></div>
            </form>
        </div>

        <div class="panel">
            <h3>Сложность</h3>
            <form id="dc-show-form">
                <div class="form-row"><input id="dc-input" name="dc_value" type="number" min="1" max="99" placeholder="1-99" required></div>
                <div class="form-row"><button type="submit">Показать</button><button type="button" id="btn-hide-dc" class="secondary">Скрыть</button></div>
            </form>
        </div>

        <div class="panel">
            <h3>Герои и враги</h3>
            <form id="entity-form" enctype="multipart/form-data">
                <input type="hidden" id="entity-id" name="id" value="">
                <div class="form-row"><input id="entity-name" name="name" placeholder="Имя" required></div>
                <div class="form-row"><select id="entity-side" name="side"><option value="hero">hero</option><option value="enemy">enemy</option></select></div>
                <div class="form-row"><input id="entity-file" type="file" name="entity_file" accept=".jpg,.jpeg,.png,.webp"></div>
                <div class="form-row"><input id="entity-ac" name="armor_class" type="number" placeholder="КД"><input id="entity-hp-current" name="hp_current" type="number" placeholder="ХП текущие"></div>
                <div class="form-row"><input id="entity-hp-max" name="hp_max" type="number" placeholder="ХП максимум"><input id="entity-sort" name="sort_order" type="number" value="0" placeholder="Порядок"></div>
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
                <div class="form-row"><select id="add-icon-entity"></select></div>
                <div class="form-row"><input id="add-icon-grid-x" type="number" min="0" value="0" placeholder="grid_x"><input id="add-icon-grid-y" type="number" min="0" value="0" placeholder="grid_y"></div>
                <div class="form-row"><input id="add-icon-size-cells" type="number" min="1" max="4" value="1" placeholder="size_cells"></div>
                <div class="form-row"><button type="submit">Добавить на карту</button></div>
            </form>
        </div>

        <div id="selected-icon-panel" class="panel hidden">
            <h3>Выбранная иконка</h3>
            <div id="selected-icon-meta" class="selected-icon-meta">Не выбрана</div>
            <form id="selected-icon-form">
                <div class="form-row"><input id="selected-icon-grid-x" type="number" min="0" placeholder="grid_x"><input id="selected-icon-grid-y" type="number" min="0" placeholder="grid_y"></div>
                <div class="form-row"><input id="selected-icon-size-cells" type="number" min="1" max="4" placeholder="size_cells"></div>
                <div class="form-row">
                    <button type="submit">Сохранить</button>
                    <button id="selected-icon-delete" type="button" class="danger">Удалить иконку</button>
                </div>
            </form>
        </div>

        <div class="panel">
            <h3>Заметки мастера</h3>
            <textarea id="notes" placeholder="Только локально в браузере"></textarea>
        </div>
    </div>

    <div class="map-stage" id="master-map-stage">
        <img id="master-map-image" class="map-image" src="" alt="map">
        <div id="master-grid-layer" class="grid-layer"></div>
        <div id="master-icons-layer" class="icons-layer"></div>
    </div>
</div>
<script src="/assets/js/common.js"></script>
<script src="/assets/js/master.js"></script>
</body>
</html>
