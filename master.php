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
        <div class="combat-sticky-group" data-group="combat-sticky-group">
            <div class="panel panel-combat" data-group="combat" data-default-open="true">
                <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 11l3 3 7-7-3-3-7 7Zm9-9 3 3 1-1-3-3-1 1Z"/></svg>Боевой сценарий</span></h3>
                <form id="combat-scenario-form" class="combat-controls-form">
                    <div class="form-row"><div class="form-field"><label for="combat-attacker" class="field-label">Кто атакует</label><select id="combat-attacker"></select></div></div>
                    <div class="form-row"><div class="form-field"><label for="combat-target" class="field-label">Кого атакуют</label><select id="combat-target"></select></div></div>
                    <div class="form-row"><div class="form-field"><label for="combat-action-type" class="field-label">Тип действия</label><select id="combat-action-type"><option value="attack">Атака</option><option value="save">Спасбросок</option><option value="check">Проверка</option><option value="damage">Урон</option><option value="custom">Пользовательский</option></select></div></div>
                    <div class="form-row compact-action-grid"><button id="combat-show-battle" type="button" class="primary">Показать бой</button><button id="combat-show-dice" type="button" class="secondary">Показать бросок</button></div>
                    <div class="form-row compact-action-grid"><button id="combat-show-result" type="button" class="primary">Показать результат</button><button id="combat-show-damage" type="button" class="secondary">Показать урон</button></div>
                    <div class="form-row"><button id="combat-hide-all" type="button" class="danger">Скрыть всё</button></div>
                </form>
            </div>

            <div class="panel panel-combat" data-group="combat" data-default-open="true">
                <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 1 5v6l7 4 7-4V5L8 1Zm0 2.1 4.9 2.8L8 8.7 3.1 5.9 8 3.1Zm-5 4.4L7 9.8v3.7l-4-2.3V7.5Zm6 6V9.8l4-2.3v3.7l-4 2.3Z"/></svg>Бросок костей</span></h3>
                <form id="dice-overlay-form">
                    <div class="form-row">
                        <div class="form-field">
                            <label for="dice-entity" class="field-label">Кто бросает</label>
                            <select id="dice-entity"></select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label for="dice-action-type" class="field-label">Тип действия</label>
                            <select id="dice-action-type">
                                <option value="attack">Атака</option>
                                <option value="save">Спасбросок</option>
                                <option value="check">Проверка</option>
                                <option value="damage">Урон</option>
                                <option value="custom">Пользовательский</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label for="dice-label" class="field-label">Подпись броска</label>
                            <input id="dice-label" type="text" placeholder="Атака / Урон / Спасбросок">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="roll-templates" id="roll-templates">
                            <button type="button" class="secondary roll-template" data-template="1d20">1d20</button>
                            <button type="button" class="secondary roll-template" data-template="1d20_adv">1d20 + преимущество</button>
                            <button type="button" class="secondary roll-template" data-template="1d20_dis">1d20 + помеха</button>
                            <button type="button" class="secondary roll-template" data-template="1d4">1d4</button>
                            <button type="button" class="secondary roll-template" data-template="1d6">1d6</button>
                            <button type="button" class="secondary roll-template" data-template="1d8">1d8</button>
                            <button type="button" class="secondary roll-template" data-template="1d10">1d10</button>
                            <button type="button" class="secondary roll-template" data-template="1d12">1d12</button>
                            <button type="button" class="secondary roll-template" data-template="2d6">2d6</button>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <div class="field-label">Режим броска</div>
                            <div id="dice-roll-mode" class="dice-roll-mode">
                                <label><input type="radio" name="dice_roll_mode" value="normal" checked> Обычный</label>
                                <label><input type="radio" name="dice_roll_mode" value="advantage"> Преимущество</label>
                                <label><input type="radio" name="dice_roll_mode" value="disadvantage"> Помеха</label>
                            </div>
                        </div>
                    </div>

                    <div id="dice-groups-list" class="dice-groups-list"></div>

                    <div class="form-row">
                        <button id="btn-add-dice-group" type="button" class="secondary">Добавить группу</button>
                    </div>

                    <div id="dice-advantage-values" class="dice-advantage-values hidden">
                        <div class="form-row">
                            <div class="form-field">
                                <label for="dice-advantage-roll-1" class="field-label">Бросок 1 (d20)</label>
                                <input id="dice-advantage-roll-1" type="number" min="1" max="20" placeholder="1..20">
                            </div>
                            <div class="form-field">
                                <label for="dice-advantage-roll-2" class="field-label">Бросок 2 (d20)</label>
                                <input id="dice-advantage-roll-2" type="number" min="1" max="20" placeholder="1..20">
                            </div>
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
                        <div id="dice-critical-preview" class="dice-critical-preview">Обычный бросок</div>
                    </div>

                    <div class="form-row">
                        <button type="submit" class="primary">Показать бросок</button>
                        <button id="btn-hide-dice-overlay" type="button" class="secondary">Скрыть бросок</button>
                    </div>
                </form>
            </div>

            <div class="panel panel-combat" data-group="combat" data-default-open="true">
                <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h12v12H2V2Zm2 2v8h8V4H4Zm2 2h4v1H6V6Zm0 2h4v1H6V8Z"/></svg>Результат броска</span></h3>
                <form id="roll-result-overlay-form">
                    <div class="form-row">
                        <div class="form-field">
                            <label for="roll-result-type" class="field-label">Тип результата</label>
                            <select id="roll-result-type" required>
                                <option value="hit">Попадание</option>
                                <option value="miss">Промах</option>
                                <option value="crit_success">Критический успех</option>
                                <option value="crit_fail">Критический провал</option>
                                <option value="save_success">Спасбросок пройден</option>
                                <option value="save_fail">Спасбросок провален</option>
                                <option value="damage">Урон</option>
                                <option value="custom">Пользовательский</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label for="roll-result-title" class="field-label">Заголовок</label>
                            <input id="roll-result-title" type="text" placeholder="Попадание" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label for="roll-result-subtitle" class="field-label">Подзаголовок</label>
                            <input id="roll-result-subtitle" type="text" placeholder="Атака паладина">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <label for="roll-result-value-text" class="field-label">Значение</label>
                            <input id="roll-result-value-text" type="text" placeholder="22 урона">
                        </div>
                    </div>
                    <div class="form-row">
                        <button type="submit" class="primary">Показать результат</button>
                        <button id="btn-hide-roll-result-overlay" type="button" class="secondary">Скрыть результат</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="selected-icon-panel" class="panel panel-scene hidden" data-group="scene" data-default-open="true">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 2 4v8l6 3 6-3V4L8 1Zm0 2.2 4 2v5.6l-4 2-4-2V5.2l4-2Z"/></svg>Выбранная иконка</span></h3>
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
                    <button type="button" class="icon-size-step secondary" data-delta="-1">-</button>
                    <button type="button" class="icon-size-step secondary" data-delta="1">+</button>
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
                    <button id="selected-icon-center" type="button" class="secondary">В центр</button>
                </div>
                <div class="form-row form-row-split">
                    <div class="form-field">
                        <label for="selected-icon-range" class="field-label">Дальность, клеток</label>
                        <input id="selected-icon-range" type="number" min="1" max="100" value="6" placeholder="range_cells">
                    </div>
                </div>
                <div class="form-row">
                    <button id="selected-icon-show-range" type="button" class="secondary">Показать дальность</button>
                    <button id="selected-icon-hide-range" type="button" class="secondary">Скрыть дальность</button>
                </div>
                <div class="form-row">
                    <button type="submit" class="primary">Сохранить</button>
                    <button id="selected-icon-delete" type="button" class="danger">Удалить иконку</button>
                </div>
            </form>
        </div>

        <div class="panel panel-scene" data-group="scene" data-default-open="true">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 3 4v8l5 3 5-3V4L8 1Zm0 2.1 3 1.8v6.2l-3 1.8-3-1.8V4.9l3-1.8Z"/></svg>Иконки на сцене</span></h3>
            <div id="scene-icons-list" class="scene-icons-list"></div>
        </div>

        <div class="panel panel-scene">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a5 5 0 1 0 0 10A5 5 0 0 0 8 2Zm0-2 1 1.7L11 .9l1 1.7 2-.2v2l1.7 1-1 1.7 1 1.7-1.7 1v2l-2-.2-1 1.7-2-1-2 1-1-1.7-2 .2v-2l-1.7-1 1-1.7-1-1.7 1.7-1v-2l2 .2 1-1.7L8 0Z"/></svg>Сложность</span></h3>
            <form id="dc-show-form">
                <div class="form-row">
                    <div class="form-field">
                        <label for="dc-input" class="field-label">Сложность</label>
                        <input id="dc-input" name="dc_value" type="number" min="1" max="99" placeholder="1-99" required>
                    </div>
                </div>
                <div class="form-row"><button type="submit" class="primary">Показать</button><button type="button" id="btn-hide-dc" class="secondary">Скрыть</button></div>
            </form>
        </div>

        <div class="panel panel-scene">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1h14v14H1V1Zm2 2v10h10V3H3Zm2 0h1v10H5V3Zm3 0h1v10H8V3Zm3 0h1v10h-1V3Z"/></svg>Сетка</span></h3>
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
                <div class="form-row"><button type="submit" class="primary">Применить</button></div>
            </form>
        </div>

        <div class="panel panel-setup">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h12v2H2V2Zm0 4h12v8H2V6Zm2 2v4h8V8H4Z"/></svg>Режим сцены</span></h3>
            <div class="form-row">
                <button id="btn-mode-prep" type="button" class="secondary">Подготовка сцены</button>
                <button id="btn-mode-map" type="button" class="secondary">Показать карту</button>
            </div>
        </div>

        <div class="panel panel-setup">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 3 5 1l5 2 5-2v12l-5 2-5-2-4 2V3Zm2 .9v8.2l2-1V2.9l-2 1Zm4-.9v8.2l2 .8V3.8L7 3Zm4 .8V12l2-.8V3l-2 .8Z"/></svg>Карты</span></h3>
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
                <div class="form-row"><button type="submit" class="secondary">Загрузить</button></div>
            </form>
            <div id="map-list"></div>
        </div>

        <div class="panel panel-setup">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1C5 1 2.5 3.2 2.5 6.5c0 3.4 2.6 5.1 5.5 8.5 2.9-3.4 5.5-5.1 5.5-8.5C13.5 3.2 11 1 8 1Zm0 2c1.8 0 3.5 1.2 3.5 3.5S9.8 10.4 8 12.6C6.2 10.4 4.5 8.8 4.5 6.5S6.2 3 8 3Z"/></svg>Боевой overlay</span></h3>
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
                    <button type="submit" class="primary">Показать бой</button>
                    <button type="button" id="btn-hide-battle-overlay" class="secondary">Скрыть бой</button>
                </div>
            </form>
        </div>

        <div class="panel panel-setup">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1a3 3 0 0 1 3 3c0 .8-.3 1.5-.8 2.1A4.5 4.5 0 0 1 13 10v4H3v-4a4.5 4.5 0 0 1 2.8-3.9A3 3 0 0 1 5 4a3 3 0 0 1 3-3Z"/></svg>Герои и враги</span></h3>
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
                <div class="form-row"><label><input id="entity-unconscious" type="checkbox" name="is_unconscious" value="1"> Без сознания</label></div>
                <div class="form-row">
                    <button id="entity-submit" type="submit" class="primary">Сохранить сущность</button>
                    <button id="entity-cancel" class="secondary hidden" type="button">Отмена редактирования</button>
                </div>
            </form>
            <div id="entity-list"></div>
        </div>

        <div class="panel panel-setup">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 2 4v8l6 3 6-3V4L8 1Zm0 2 4 2.2V11l-4 2-4-2V5.2L8 3Zm-.8 2v2H5v1h2.2v2h1.6V8H11V7H8.8V5H7.2Z"/></svg>Добавление иконки</span></h3>
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
                <div class="form-row"><button type="submit" class="primary">Добавить на карту</button></div>
            </form>
        </div>

        <div class="panel panel-system">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3Zm0-3 1 2 2-.5.6 2 2 .6-.5 2 2 1-1 1.7 1 1.7-2 1 .5 2-2 .6-.6 2-2-.5-1 2-1-2-2 .5-.6-2-2-.6.5-2-2-1L1 8.7l-1-1.7 2-1-.5-2 2-.6.6-2 2 .5L8 0Z"/></svg>Диагностика сцены</span></h3>
            <div class="form-row">
                <label><input id="scene-debug-toggle" type="checkbox"> Диагностика сцены</label>
            </div>
            <div id="scene-debug-info" class="scene-debug-info">Debug выключен</div>
        </div>

        <div class="panel panel-system">
            <h3><span class="panel-heading"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1h8l3 3v11H3V1Zm2 2v10h7V5.2L10.8 3H5Zm1 3h5v1H6V6Zm0 2h5v1H6V8Z"/></svg>Заметки мастера</span></h3>
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
