(function () {
    const stateEls = {
        mapImage: document.getElementById('master-map-image'),
        mapStage: document.getElementById('master-map-stage'),
        sceneLayer: document.getElementById('master-scene-layer'),
        gridLayer: document.getElementById('master-grid-layer'),
        iconsLayer: document.getElementById('master-icons-layer'),
        abilityLayer: document.getElementById('master-ability-overlay-layer'),
        movementLayer: document.getElementById('master-movement-overlay-layer'),
        hoverLayer: document.getElementById('master-hover-overlay-layer'),
        gridEnabled: document.getElementById('grid-enabled'),
        gridCellSize: document.getElementById('grid-cell-size'),
        mapList: document.getElementById('map-list'),
        entityList: document.getElementById('entity-list'),
        addIconEntity: document.getElementById('add-icon-entity'),
        addIconGridX: document.getElementById('add-icon-grid-x'),
        addIconGridY: document.getElementById('add-icon-grid-y'),
        addIconSizeCells: document.getElementById('add-icon-size-cells'),
        entityForm: document.getElementById('entity-form'),
        entityId: document.getElementById('entity-id'),
        entityName: document.getElementById('entity-name'),
        entitySide: document.getElementById('entity-side'),
        entityAc: document.getElementById('entity-ac'),
        entityHpCurrent: document.getElementById('entity-hp-current'),
        entityHpMax: document.getElementById('entity-hp-max'),
        entitySort: document.getElementById('entity-sort'),
        entityVisible: document.getElementById('entity-visible'),
        entityUnconscious: document.getElementById('entity-unconscious'),
        entitySubmit: document.getElementById('entity-submit'),
        entityCancel: document.getElementById('entity-cancel'),
        selectedIconPanel: document.getElementById('selected-icon-panel'),
        selectedIconMeta: document.getElementById('selected-icon-meta'),
        selectedIconForm: document.getElementById('selected-icon-form'),
        selectedIconGridX: document.getElementById('selected-icon-grid-x'),
        selectedIconGridY: document.getElementById('selected-icon-grid-y'),
        selectedIconSizeCells: document.getElementById('selected-icon-size-cells'),
        selectedIconDelete: document.getElementById('selected-icon-delete'),
        selectedIconCenter: document.getElementById('selected-icon-center'),
        selectedIconRange: document.getElementById('selected-icon-range'),
        selectedIconShowRange: document.getElementById('selected-icon-show-range'),
        selectedIconHideRange: document.getElementById('selected-icon-hide-range'),
        sceneIconsList: document.getElementById('scene-icons-list'),
        movementModeToggle: document.getElementById('movement-mode-toggle'),
        movementDebugToggle: document.getElementById('movement-debug-toggle'),
        sceneDebugToggle: document.getElementById('scene-debug-toggle'),
        sceneDebugInfo: document.getElementById('scene-debug-info'),
        debugLayer: document.getElementById('master-debug-layer'),
        combatScenarioForm: document.getElementById('combat-scenario-form'),
        combatAttacker: document.getElementById('combat-attacker'),
        combatTarget: document.getElementById('combat-target'),
        combatActionType: document.getElementById('combat-action-type'),
        combatShowBattle: document.getElementById('combat-show-battle'),
        combatShowDice: document.getElementById('combat-show-dice'),
        combatShowResult: document.getElementById('combat-show-result'),
        combatShowDamage: document.getElementById('combat-show-damage'),
        combatHideAll: document.getElementById('combat-hide-all'),
        battleOverlayForm: document.getElementById('battle-overlay-form'),
        battleAttackerEntity: document.getElementById('battle-attacker-entity'),
        battleTargetEntity: document.getElementById('battle-target-entity'),
        battleHideButton: document.getElementById('btn-hide-battle-overlay'),
        diceOverlayForm: document.getElementById('dice-overlay-form'),
        diceEntity: document.getElementById('dice-entity'),
        diceActionType: document.getElementById('dice-action-type'),
        diceLabel: document.getElementById('dice-label'),
        diceRollMode: document.getElementById('dice-roll-mode'),
        diceGroupsList: document.getElementById('dice-groups-list'),
        diceAddGroupButton: document.getElementById('btn-add-dice-group'),
        diceAdvantageValues: document.getElementById('dice-advantage-values'),
        diceAdvantageRoll1: document.getElementById('dice-advantage-roll-1'),
        diceAdvantageRoll2: document.getElementById('dice-advantage-roll-2'),
        diceModifier: document.getElementById('dice-modifier'),
        diceTotal: document.getElementById('dice-total'),
        diceCriticalPreview: document.getElementById('dice-critical-preview'),
        diceHideButton: document.getElementById('btn-hide-dice-overlay'),
        rollResultOverlayForm: document.getElementById('roll-result-overlay-form'),
        rollResultType: document.getElementById('roll-result-type'),
        rollResultTitle: document.getElementById('roll-result-title'),
        rollResultSubtitle: document.getElementById('roll-result-subtitle'),
        rollResultValueText: document.getElementById('roll-result-value-text'),
        rollResultHideButton: document.getElementById('btn-hide-roll-result-overlay'),
    };

    let latestState = null;
    let editingEntityId = null;
    let selectedIconId = null;
    let movementModeEnabled = false;
    let hoverCell = null;
    let gridFormDirty = false;
    let pauseUpdatesUntil = 0;
    let diceGroups = [];
    let diceRollMode = 'normal';
    let advantageValues = [null, null];
    const INTERACTION_TIMEOUT_MS = 8000;
    const battleScenarioDraft = {
        attackerEntityId: '',
        targetEntityId: '',
        actionType: '',
        isDirty: false,
        isInteracting: false,
        lastTouchedAt: 0,
    };


    function pauseUpdates(ms = 1800) {
        pauseUpdatesUntil = Math.max(pauseUpdatesUntil, Date.now() + ms);
    }

    function isUpdatesPaused() {
        return Date.now() < pauseUpdatesUntil || document.querySelector('.item-menu.open') !== null;
    }

    function closeAllActionMenus() {
        document.querySelectorAll('.item-menu.open').forEach(menu => menu.classList.remove('open'));
    }

    function markBattleScenarioTouched() {
        battleScenarioDraft.isDirty = true;
        battleScenarioDraft.isInteracting = true;
        battleScenarioDraft.lastTouchedAt = Date.now();
        battleScenarioDraft.attackerEntityId = stateEls.combatAttacker?.value || stateEls.battleAttackerEntity?.value || '';
        battleScenarioDraft.targetEntityId = stateEls.combatTarget?.value || stateEls.battleTargetEntity?.value || '';
        battleScenarioDraft.actionType = stateEls.combatActionType?.value || '';
    }

    function clearBattleScenarioInteraction() {
        battleScenarioDraft.isInteracting = false;
        battleScenarioDraft.lastTouchedAt = Date.now();
    }

    function isBattleScenarioInteracting() {
        if (!battleScenarioDraft.isInteracting) {
            return false;
        }
        return Date.now() - battleScenarioDraft.lastTouchedAt < INTERACTION_TIMEOUT_MS;
    }

    function buildEntitySignature(entities, labelFormatter = entity => entity.name || '') {
        return (entities || []).map(entity => `${entity.id}|${labelFormatter(entity)}`).join('||');
    }

    function softUpdateSelectOptions(selectEl, entities, { placeholder = '', labelFormatter = entity => entity.name || '' } = {}) {
        if (!selectEl) {
            return false;
        }
        const nextSignature = buildEntitySignature(entities, labelFormatter);
        const prevSignature = selectEl.dataset.optionsSignature || '';
        if (prevSignature === nextSignature) {
            return false;
        }

        const fragment = document.createDocumentFragment();
        if (placeholder !== null) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = placeholder;
            fragment.appendChild(placeholderOption);
        }

        (entities || []).forEach(entity => {
            const option = document.createElement('option');
            option.value = String(entity.id);
            option.textContent = labelFormatter(entity);
            fragment.appendChild(option);
        });

        selectEl.replaceChildren(fragment);
        selectEl.dataset.optionsSignature = nextSignature;
        return true;
    }

    function toggleActionMenu(button) {
        const container = button.closest('.item-menu');
        if (!container) {
            return;
        }

        const isOpen = container.classList.contains('open');
        pauseUpdates(3500);
        closeAllActionMenus();
        if (!isOpen) {
            container.classList.add('open');
        }
    }

    async function postForm(url, entries, isMultipart = false) {
        const form = isMultipart ? entries : new FormData();
        if (!isMultipart) {
            Object.entries(entries).forEach(([k, v]) => form.append(k, v));
        }
        const payload = await DndCommon.apiPost(url, form);
        if (!payload.ok) throw new Error(payload.error || 'api_error');
        return payload.data;
    }


    function formatSideLabel(side) {
        const labels = {
            hero: 'Герой',
            enemy: 'Враг',
            boss: 'Босс',
            npc: 'Нейтрал',
        };
        return labels[side] || side || '-';
    }

    const DICE_MAX_VALUES = {
        d4: 4,
        d6: 6,
        d8: 8,
        d10: 10,
        d12: 12,
        d20: 20,
    };

    function getDiceMaxValue(diceType) {
        return DICE_MAX_VALUES[diceType] || 6;
    }

    function calculateCriticalState(groups) {
        const d20Groups = groups.filter(group => group.dice_type === 'd20');
        if (d20Groups.length !== 1) {
            return 'none';
        }
        const singleD20 = d20Groups[0];
        if (Number(singleD20.dice_count) !== 1 || !Array.isArray(singleD20.dice_values) || singleD20.dice_values.length !== 1) {
            return 'none';
        }
        if (singleD20.dice_values[0] === 20) {
            return 'success';
        }
        if (singleD20.dice_values[0] === 1) {
            return 'fail';
        }
        return 'none';
    }

    function getSelectedRollForMode(mode, values) {
        if (!Array.isArray(values) || values.length !== 2) {
            return null;
        }
        const [first, second] = values;
        if (!Number.isInteger(first) || !Number.isInteger(second)) {
            return null;
        }
        if (mode === 'advantage') {
            return Math.max(first, second);
        }
        if (mode === 'disadvantage') {
            return Math.min(first, second);
        }
        return null;
    }

    function getCurrentDiceRollMode() {
        const selected = stateEls.diceRollMode?.querySelector('input[name="dice_roll_mode"]:checked');
        return selected?.value || 'normal';
    }

    function sanitizeAdvantageValues(values) {
        const source = Array.isArray(values) ? values : [];
        return [0, 1].map(index => {
            const value = Number(source[index]);
            if (!Number.isInteger(value) || value < 1 || value > 20) {
                return null;
            }
            return value;
        });
    }

    function updateDiceModeUI() {
        const isSpecialMode = diceRollMode === 'advantage' || diceRollMode === 'disadvantage';
        stateEls.diceGroupsList?.classList.toggle('hidden', isSpecialMode);
        stateEls.diceAddGroupButton?.classList.toggle('hidden', isSpecialMode);
        stateEls.diceAdvantageValues?.classList.toggle('hidden', !isSpecialMode);
    }

    function createDefaultDiceGroup() {
        return {
            dice_type: 'd6',
            dice_count: 1,
            dice_values: [null],
        };
    }

    function sanitizeGroup(group) {
        const diceType = DICE_MAX_VALUES[group.dice_type] ? group.dice_type : 'd6';
        const maxValue = getDiceMaxValue(diceType);
        const diceCount = Math.min(20, Math.max(1, Number(group.dice_count) || 1));
        const diceValues = Array.from({ length: diceCount }, (_, index) => {
            const raw = group.dice_values?.[index];
            const parsed = Number(raw);
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > maxValue) {
                return null;
            }
            return parsed;
        });

        return {
            dice_type: diceType,
            dice_count: diceCount,
            dice_values: diceValues,
        };
    }

    function renderDiceGroups() {
        if (!stateEls.diceGroupsList) {
            return;
        }
        updateDiceModeUI();

        stateEls.diceGroupsList.innerHTML = '';

        diceGroups.forEach((group, groupIndex) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'dice-group-item';

            const header = document.createElement('div');
            header.className = 'dice-group-header';
            header.innerHTML = `<strong>Группа ${groupIndex + 1}</strong>`;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'secondary dice-group-remove';
            removeButton.textContent = 'Удалить группу';
            removeButton.disabled = diceGroups.length <= 1;
            removeButton.addEventListener('click', () => {
                diceGroups = diceGroups.filter((_, index) => index !== groupIndex);
                if (!diceGroups.length) {
                    diceGroups = [createDefaultDiceGroup()];
                }
                renderDiceGroups();
            });
            header.appendChild(removeButton);
            wrapper.appendChild(header);

            const controls = document.createElement('div');
            controls.className = 'dice-group-controls';
            controls.innerHTML = `
                <div class="form-field">
                    <label class="field-label">Тип куба</label>
                    <select data-role="dice-type" data-index="${groupIndex}">
                        <option value="d4" ${group.dice_type === 'd4' ? 'selected' : ''}>d4</option>
                        <option value="d6" ${group.dice_type === 'd6' ? 'selected' : ''}>d6</option>
                        <option value="d8" ${group.dice_type === 'd8' ? 'selected' : ''}>d8</option>
                        <option value="d10" ${group.dice_type === 'd10' ? 'selected' : ''}>d10</option>
                        <option value="d12" ${group.dice_type === 'd12' ? 'selected' : ''}>d12</option>
                        <option value="d20" ${group.dice_type === 'd20' ? 'selected' : ''}>d20</option>
                    </select>
                </div>
                <div class="form-field">
                    <label class="field-label">Количество</label>
                    <input type="number" min="1" max="20" data-role="dice-count" data-index="${groupIndex}" value="${group.dice_count}">
                </div>
            `;
            wrapper.appendChild(controls);

            const valuesWrap = document.createElement('div');
            valuesWrap.className = 'dice-values-fields';
            const maxValue = getDiceMaxValue(group.dice_type);
            for (let valueIndex = 0; valueIndex < group.dice_count; valueIndex += 1) {
                const valueInput = document.createElement('input');
                valueInput.type = 'number';
                valueInput.min = '1';
                valueInput.max = String(maxValue);
                valueInput.placeholder = `Куб ${valueIndex + 1}`;
                valueInput.value = group.dice_values[valueIndex] ?? '';
                valueInput.dataset.role = 'dice-value';
                valueInput.dataset.index = String(groupIndex);
                valueInput.dataset.valueIndex = String(valueIndex);
                valuesWrap.appendChild(valueInput);
            }
            wrapper.appendChild(valuesWrap);

            stateEls.diceGroupsList.appendChild(wrapper);
        });

        stateEls.diceGroupsList.querySelectorAll('[data-role="dice-type"]').forEach(select => {
            select.addEventListener('change', e => {
                const index = Number(e.target.dataset.index);
                diceGroups[index].dice_type = e.target.value;
                diceGroups[index] = sanitizeGroup(diceGroups[index]);
                renderDiceGroups();
            });
        });

        stateEls.diceGroupsList.querySelectorAll('[data-role="dice-count"]').forEach(input => {
            input.addEventListener('input', e => {
                const index = Number(e.target.dataset.index);
                diceGroups[index].dice_count = Number(e.target.value || 1);
                diceGroups[index] = sanitizeGroup(diceGroups[index]);
                renderDiceGroups();
            });
        });

        stateEls.diceGroupsList.querySelectorAll('[data-role="dice-value"]').forEach(input => {
            input.addEventListener('input', e => {
                const groupIndex = Number(e.target.dataset.index);
                const valueIndex = Number(e.target.dataset.valueIndex);
                const max = getDiceMaxValue(diceGroups[groupIndex].dice_type);
                const raw = Number(e.target.value);
                if (Number.isInteger(raw) && raw >= 1 && raw <= max) {
                    diceGroups[groupIndex].dice_values[valueIndex] = raw;
                } else {
                    diceGroups[groupIndex].dice_values[valueIndex] = null;
                }
                recalculateDiceTotal();
            });
        });

        recalculateDiceTotal();
    }

    function recalculateDiceTotal() {
        if (!stateEls.diceTotal) {
            return;
        }
        const modifier = Number(stateEls.diceModifier?.value || 0);
        const normalizedModifier = Number.isFinite(modifier) ? Math.trunc(modifier) : 0;
        const isSpecialMode = diceRollMode === 'advantage' || diceRollMode === 'disadvantage';
        const valuesSum = isSpecialMode
            ? (getSelectedRollForMode(diceRollMode, advantageValues) || 0)
            : diceGroups.reduce((sum, group) => {
                const groupSum = (group.dice_values || []).reduce((acc, value) => acc + (Number.isInteger(value) ? value : 0), 0);
                return sum + groupSum;
            }, 0);
        const total = valuesSum + normalizedModifier;
        stateEls.diceTotal.value = String(total);

        const criticalState = isSpecialMode
            ? (() => {
                const selected = getSelectedRollForMode(diceRollMode, advantageValues);
                if (selected === 20) {
                    return 'success';
                }
                if (selected === 1) {
                    return 'fail';
                }
                return 'none';
            })()
            : calculateCriticalState(diceGroups);
        if (stateEls.diceCriticalPreview) {
            stateEls.diceCriticalPreview.classList.remove('crit-success', 'crit-fail');
            if (criticalState === 'success') {
                stateEls.diceCriticalPreview.textContent = 'Критический успех';
                stateEls.diceCriticalPreview.classList.add('crit-success');
            } else if (criticalState === 'fail') {
                stateEls.diceCriticalPreview.textContent = 'Критический провал';
                stateEls.diceCriticalPreview.classList.add('crit-fail');
            } else {
                stateEls.diceCriticalPreview.textContent = isSpecialMode ? 'Преимущество / помеха' : 'Обычный бросок';
            }
        }
    }

    function getValidatedDiceGroups() {
        const groups = diceGroups.map(sanitizeGroup);
        groups.forEach((group, groupIndex) => {
            const maxValue = getDiceMaxValue(group.dice_type);
            if ((group.dice_values || []).length !== group.dice_count) {
                throw new Error(`Группа ${groupIndex + 1}: неверное количество значений`);
            }
            group.dice_values.forEach((value, valueIndex) => {
                if (!Number.isInteger(value) || value < 1 || value > maxValue) {
                    throw new Error(`Группа ${groupIndex + 1}, куб ${valueIndex + 1}: нужно значение 1..${maxValue}`);
                }
            });
        });
        return groups;
    }

    function getValidatedAdvantageValues() {
        const values = sanitizeAdvantageValues(advantageValues);
        values.forEach((value, index) => {
            if (!Number.isInteger(value)) {
                throw new Error(`Бросок ${index + 1}: нужно значение 1..20`);
            }
        });
        return values;
    }



    function setEntityEditing(entity = null) {
        editingEntityId = entity ? Number(entity.id) : null;
        if (!entity) {
            stateEls.entityId.value = '';
            stateEls.entityForm.reset();
            stateEls.entityVisible.checked = true;
        if (stateEls.entityUnconscious) {
            stateEls.entityUnconscious.checked = false;
        }
            stateEls.entitySort.value = 0;
            stateEls.entitySubmit.textContent = 'Сохранить сущность';
            stateEls.entityCancel.classList.add('hidden');
            return;
        }

        stateEls.entityId.value = entity.id;
        stateEls.entityName.value = entity.name || '';
        stateEls.entitySide.value = entity.side;
        stateEls.entityAc.value = entity.armor_class ?? '';
        stateEls.entityHpCurrent.value = entity.hp_current ?? '';
        stateEls.entityHpMax.value = entity.hp_max ?? '';
        stateEls.entitySort.value = entity.sort_order ?? 0;
        stateEls.entityVisible.checked = Boolean(entity.is_visible);
        stateEls.entitySubmit.textContent = 'Сохранить изменения';
        stateEls.entityCancel.classList.remove('hidden');
    }

    function setSelectedIcon(icon = null) {
        selectedIconId = icon ? Number(icon.id) : null;
        hoverCell = null;
        if (!icon) {
            stateEls.selectedIconPanel.classList.add('hidden');
            return;
        }

        const entity = latestState?.entities.find(e => Number(e.id) === Number(icon.entity_id));
        stateEls.selectedIconPanel.classList.remove('hidden');
        stateEls.selectedIconMeta.textContent = [
            `#${icon.id} — ${icon.name || 'Без имени'} (${formatSideLabel(entity?.side)})`,
            `Координаты: (${icon.grid_x}, ${icon.grid_y}), size ${icon.size_cells}`,
            `image_path: ${icon.image_path ? 'есть' : 'нет'}`
        ].join(' • ');
        stateEls.selectedIconGridX.value = icon.grid_x;
        stateEls.selectedIconGridY.value = icon.grid_y;
        stateEls.selectedIconSizeCells.value = icon.size_cells;
    }

    function getSelectedIcon(state) {
        if (!selectedIconId || !state) {
            return null;
        }
        return state.icons.find(i => Number(i.id) === Number(selectedIconId)) || null;
    }

    function getMovementDistance(icon, cellX, cellY) {
        if (!icon) {
            return Number.POSITIVE_INFINITY;
        }
        return Math.abs(Number(cellX) - Number(icon.grid_x)) + Math.abs(Number(cellY) - Number(icon.grid_y));
    }

    function getMovementBand(distance) {
        if (distance <= 6) {
            return 'walk';
        }
        if (distance <= 12) {
            return 'dash';
        }
        return 'invalid';
    }

    function toSceneCell(event, state) {
        const rect = stateEls.sceneLayer.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return null;
        }
        const scaleX = rect.width / Math.max(1, stateEls.sceneLayer.offsetWidth);
        const scaleY = rect.height / Math.max(1, stateEls.sceneLayer.offsetHeight);
        const x = Math.floor((event.clientX - rect.left) / (state.grid_cell_size * scaleX));
        const y = Math.floor((event.clientY - rect.top) / (state.grid_cell_size * scaleY));
        if (x < 0 || y < 0) {
            return null;
        }
        const maxX = Math.floor((stateEls.sceneLayer.offsetWidth - 1) / state.grid_cell_size);
        const maxY = Math.floor((stateEls.sceneLayer.offsetHeight - 1) / state.grid_cell_size);
        if (x > maxX || y > maxY) {
            return null;
        }
        return { x, y };
    }

    function renderAbilityCells(state) {
        stateEls.abilityLayer.innerHTML = '';
        const overlay = state.ability_overlay;
        if (!overlay?.active || !overlay.icon_id || !overlay.range_cells) {
            return;
        }
        const icon = (state.icons || []).find(row => Number(row.id) === Number(overlay.icon_id));
        if (!icon) {
            return;
        }
        const centerX = Number(icon.grid_x);
        const centerY = Number(icon.grid_y);
        const radius = Math.max(1, Number(overlay.range_cells) || 1);
        const cellSize = Number(state.grid_cell_size) || 70;
        for (let y = centerY - radius; y <= centerY + radius; y += 1) {
            for (let x = centerX - radius; x <= centerX + radius; x += 1) {
                const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
                if (distance > radius || x < 0 || y < 0) {
                    continue;
                }
                const cell = document.createElement('div');
                cell.className = 'ability-cell';
                cell.style.left = `${x * cellSize}px`;
                cell.style.top = `${y * cellSize}px`;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                stateEls.abilityLayer.appendChild(cell);
            }
        }
    }

    function renderMovementOverlay(state, icon) {
        stateEls.movementLayer.innerHTML = '';
        if (!movementModeEnabled || !icon) {
            return;
        }
        const cols = Math.ceil(stateEls.sceneLayer.offsetWidth / state.grid_cell_size);
        const rows = Math.ceil(stateEls.sceneLayer.offsetHeight / state.grid_cell_size);
        const showDebug = Boolean(stateEls.movementDebugToggle?.checked);
        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                const distance = getMovementDistance(icon, x, y);
                const band = getMovementBand(distance);
                if (band === 'invalid') {
                    continue;
                }
                const cell = document.createElement('div');
                cell.className = `movement-cell ${band}`;
                cell.style.left = `${x * state.grid_cell_size}px`;
                cell.style.top = `${y * state.grid_cell_size}px`;
                cell.style.width = `${state.grid_cell_size}px`;
                cell.style.height = `${state.grid_cell_size}px`;
                if (showDebug) {
                    const label = document.createElement('span');
                    label.className = 'movement-debug-label';
                    label.textContent = `${x},${y} • ${distance}`;
                    cell.appendChild(label);
                }
                stateEls.movementLayer.appendChild(cell);
            }
        }
    }

    function renderHoverPreview(state, icon) {
        stateEls.hoverLayer.innerHTML = '';
        if (!movementModeEnabled || !icon || !hoverCell) {
            return;
        }
        const distance = getMovementDistance(icon, hoverCell.x, hoverCell.y);
        const band = getMovementBand(distance);
        const cell = document.createElement('div');
        const isValid = band !== 'invalid';
        cell.className = `hover-cell ${isValid ? `valid ${band}` : 'invalid'}`;
        cell.style.left = `${hoverCell.x * state.grid_cell_size}px`;
        cell.style.top = `${hoverCell.y * state.grid_cell_size}px`;
        cell.style.width = `${state.grid_cell_size}px`;
        cell.style.height = `${state.grid_cell_size}px`;
        const label = document.createElement('span');
        label.className = 'hover-cell-label';
        label.textContent = isValid ? `${band === 'walk' ? 'Ход' : 'Рывок'} • ${distance}` : `Недоступно • ${distance}`;
        cell.appendChild(label);
        stateEls.hoverLayer.appendChild(cell);
    }

    function getSceneCenterCell(state, metrics, icon = null) {
        const sceneWidth = metrics?.mapWidth || stateEls.sceneLayer.offsetWidth || 1;
        const sceneHeight = metrics?.mapHeight || stateEls.sceneLayer.offsetHeight || 1;
        const cols = Math.max(1, Math.floor(sceneWidth / state.grid_cell_size));
        const rows = Math.max(1, Math.floor(sceneHeight / state.grid_cell_size));
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);

        return {
            grid_x: Math.max(0, centerX),
            grid_y: Math.max(0, centerY),
            size_cells: Number(icon?.size_cells || 1),
        };
    }

    async function centerIconById(iconId, metrics = null) {
        if (!latestState) {
            return;
        }
        const icon = latestState.icons.find(i => Number(i.id) === Number(iconId));
        if (!icon) {
            return;
        }
        const center = getSceneCenterCell(latestState, metrics, icon);
        await postForm('/api/update_icon.php', {
            id: icon.id,
            grid_x: center.grid_x,
            grid_y: center.grid_y,
            size_cells: center.size_cells,
        });
        selectedIconId = Number(icon.id);
    }

    function fillMapList() {
        DndCommon.apiGet('/api/list_maps.php').then(payload => {
            const maps = payload.ok ? payload.data.maps : [];
            stateEls.mapList.innerHTML = maps.map(m => `<div class="list-item map-list-item">
                <span class="item-title">${DndCommon.escapeHtml(m.title)}</span>
                <div class="item-controls">
                    ${m.is_active
            ? '<span class="status-badge">Активна</span>'
            : `<button data-id="${m.id}" class="activate-map" type="button">Активировать</button>`}
                    <div class="item-menu" data-type="map" data-id="${m.id}">
                        <button type="button" class="menu-toggle" aria-label="Действия карты">...</button>
                        <div class="dropdown-menu">
                            <button data-id="${m.id}" data-title="${DndCommon.escapeHtml(m.title)}" class="rename-map" type="button">Переименовать</button>
                            <button data-id="${m.id}" class="delete-map danger" type="button">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>`).join('');
        });
    }

    function fillEntityList(state) {
        const entities = state.entities;
        stateEls.entityList.innerHTML = entities.map(e => `<div class="list-item entity-list-item">
            <span class="item-title">${DndCommon.escapeHtml(e.name)} • ${formatSideLabel(e.side)} • КД ${e.armor_class ?? '-'} • ХП ${e.hp_current ?? '-'}${e.hp_max !== null ? `/${e.hp_max}` : ''}${Number(e.is_unconscious) === 1 ? ' • без сознания' : ''}</span>
            <div class="item-controls">
                <div class="item-menu" data-type="entity" data-id="${e.id}">
                    <button type="button" class="menu-toggle" aria-label="Действия сущности">...</button>
                    <div class="dropdown-menu">
                        <button class="edit-entity" data-id="${e.id}" type="button">Редактировать</button>
                        <button class="quick-add-icon" data-id="${e.id}" type="button">Добавить на карту</button>
                        <button class="duplicate-entity" data-id="${e.id}" type="button">Дублировать</button>
                        <button class="toggle-unconscious" data-id="${e.id}" data-value="${Number(e.is_unconscious) === 1 ? 0 : 1}" type="button">${Number(e.is_unconscious) === 1 ? 'В сознании' : 'Без сознания'}</button>
                        <button class="hide-entity" data-id="${e.id}" type="button">Скрыть сущность</button>
                        <button class="remove-entity-icons" data-id="${e.id}" type="button">Убрать с карты</button>
                        <div class="quick-stats">
                            <span>ХП:</span>
                            <button class="quick-stat" data-id="${e.id}" data-hp="-5" type="button">-5</button>
                            <button class="quick-stat" data-id="${e.id}" data-hp="-1" type="button">-1</button>
                            <button class="quick-stat" data-id="${e.id}" data-hp="1" type="button">+1</button>
                            <button class="quick-stat" data-id="${e.id}" data-hp="5" type="button">+5</button>
                        </div>
                        <div class="quick-stats">
                            <span>КД:</span>
                            <button class="quick-stat" data-id="${e.id}" data-ac="-1" type="button">-1</button>
                            <button class="quick-stat" data-id="${e.id}" data-ac="1" type="button">+1</button>
                        </div>
                        <button class="danger del-entity" data-id="${e.id}" type="button">Удалить</button>
                    </div>
                </div>
            </div>
        </div>`).join('');

        const previousValue = stateEls.addIconEntity.value;
        stateEls.addIconEntity.innerHTML = entities.map(e => `<option value="${e.id}">${DndCommon.escapeHtml(e.name)}</option>`).join('');
        if (previousValue && entities.some(e => String(e.id) === previousValue)) {
            stateEls.addIconEntity.value = previousValue;
        }

        const hasEntity = value => Boolean(value) && entities.some(e => String(e.id) === String(value));
        const isInteracting = isBattleScenarioInteracting();

        if (!battleScenarioDraft.isDirty) {
            battleScenarioDraft.attackerEntityId = stateEls.combatAttacker?.value || stateEls.battleAttackerEntity?.value || '';
            battleScenarioDraft.targetEntityId = stateEls.combatTarget?.value || stateEls.battleTargetEntity?.value || '';
            battleScenarioDraft.actionType = stateEls.combatActionType?.value || '';
        }

        const previousBattleAttacker = stateEls.battleAttackerEntity?.value || '';
        const previousBattleTarget = stateEls.battleTargetEntity?.value || '';
        const previousCombatAttacker = stateEls.combatAttacker?.value || '';
        const previousCombatTarget = stateEls.combatTarget?.value || '';

        const battleSelectsChanged = [
            softUpdateSelectOptions(stateEls.battleAttackerEntity, entities, { placeholder: '— Выберите —' }),
            softUpdateSelectOptions(stateEls.battleTargetEntity, entities, { placeholder: '— Выберите —' }),
            softUpdateSelectOptions(stateEls.combatAttacker, entities, { placeholder: '— Выберите —' }),
            softUpdateSelectOptions(stateEls.combatTarget, entities, { placeholder: '— Выберите —' }),
        ].some(Boolean);

        if (battleSelectsChanged || !isInteracting) {
            const desiredAttacker = battleScenarioDraft.attackerEntityId || previousCombatAttacker || previousBattleAttacker || '';
            const desiredTarget = battleScenarioDraft.targetEntityId || previousCombatTarget || previousBattleTarget || '';

            const attackerValue = hasEntity(desiredAttacker) ? String(desiredAttacker) : '';
            const targetValue = hasEntity(desiredTarget) ? String(desiredTarget) : '';

            if (stateEls.combatAttacker) {
                stateEls.combatAttacker.value = attackerValue;
            }
            if (stateEls.battleAttackerEntity) {
                stateEls.battleAttackerEntity.value = attackerValue;
            }
            if (stateEls.combatTarget) {
                stateEls.combatTarget.value = targetValue;
            }
            if (stateEls.battleTargetEntity) {
                stateEls.battleTargetEntity.value = targetValue;
            }

            battleScenarioDraft.attackerEntityId = attackerValue;
            battleScenarioDraft.targetEntityId = targetValue;
        }

        const previousDiceEntity = stateEls.diceEntity?.value || '';
        const diceSelectChanged = softUpdateSelectOptions(stateEls.diceEntity, entities, {
            placeholder: 'Без сущности',
            labelFormatter: entity => `${entity.name} (${formatSideLabel(entity.side)})`,
        });
        if (stateEls.diceEntity && diceSelectChanged) {
            stateEls.diceEntity.value = hasEntity(previousDiceEntity) ? previousDiceEntity : '';
        }
    }

    function renderSceneIconsList(state, metrics) {
        const icons = state.icons || [];
        if (!icons.length) {
            stateEls.sceneIconsList.innerHTML = '<div class="scene-icon-meta">Иконок нет.</div>';
            return;
        }

        stateEls.sceneIconsList.innerHTML = icons.map(icon => {
            const selectedClass = Number(icon.id) === Number(selectedIconId) ? ' selected' : '';
            return `<div class="scene-icon-row${selectedClass}" data-id="${icon.id}">
                <div class="scene-icon-meta">#${icon.id} ${DndCommon.escapeHtml(icon.name || 'Без имени')} • (${icon.grid_x}, ${icon.grid_y}) • size ${icon.size_cells}</div>
                <div class="scene-icon-actions">
                    <button type="button" class="scene-select secondary" data-id="${icon.id}">Выбрать</button>
                    <button type="button" class="scene-center secondary" data-id="${icon.id}">В центр</button>
                    <button type="button" class="scene-delete danger" data-id="${icon.id}">Удалить</button>
                </div>
            </div>`;
        }).join('');
    }

    function render(state) {
        latestState = state;

        if (isUpdatesPaused()) {
            return;
        }

        fillMapList();
        fillEntityList(state);

        if (!gridFormDirty) {
            stateEls.gridEnabled.checked = Boolean(state.grid_enabled);
            stateEls.gridCellSize.value = state.grid_cell_size;
        }

        const selected = state.icons.find(i => Number(i.id) === Number(selectedIconId)) || null;
        if (!selected && selectedIconId !== null) {
            setSelectedIcon(null);
        } else if (selected) {
            setSelectedIcon(selected);
        }

        const selectedIcon = getSelectedIcon(state);
        const isDebug = Boolean(stateEls.sceneDebugToggle?.checked);
        const metrics = DndCommon.renderScene({
            stage: stateEls.mapStage,
            sceneLayer: stateEls.sceneLayer,
            mapImage: stateEls.mapImage,
            gridLayer: stateEls.gridLayer,
            iconsLayer: stateEls.iconsLayer,
            mapPath: state.active_map ? state.active_map.file_path : '',
            gridCellSize: state.grid_cell_size,
            gridEnabled: Boolean(state.grid_enabled),
            icons: state.icons,
            iconOptions: {
                interactive: true,
                selectedIconId,
                showSelection: true,
                debug: isDebug,
                debugFormatter: icon => `#${icon.id} ${icon.name || 'Без имени'} (${icon.grid_x},${icon.grid_y}) s${icon.size_cells}`,
                onIconClick: icon => setSelectedIcon(icon),
                onDrop: async e => {
                    e.preventDefault();
                    const id = Number(e.dataTransfer.getData('text/plain'));
                    const rect = stateEls.sceneLayer.getBoundingClientRect();
                    const scaleX = rect.width / Math.max(1, stateEls.sceneLayer.offsetWidth);
                    const scaleY = rect.height / Math.max(1, stateEls.sceneLayer.offsetHeight);
                    const x = Math.max(0, Math.floor((e.clientX - rect.left) / (state.grid_cell_size * scaleX)));
                    const y = Math.max(0, Math.floor((e.clientY - rect.top) / (state.grid_cell_size * scaleY)));
                    if (movementModeEnabled) {
                        const draggedIcon = state.icons.find(i => Number(i.id) === id);
                        const distance = getMovementDistance(draggedIcon, x, y);
                        if (getMovementBand(distance) === 'invalid') {
                            return;
                        }
                    }
                    await postForm('/api/move_icon.php', { id, grid_x: x, grid_y: y });
                    selectedIconId = id;
                    render(await DndCommon.fetchState());
                }
            },
            onImageLoad: async () => render(await DndCommon.fetchState()),
        });

        renderAbilityCells(state);
        renderMovementOverlay(state, selectedIcon);
        renderHoverPreview(state, selectedIcon);
        renderSceneIconsList(state, metrics);
        renderSceneDebug(state, metrics);
    }


    function renderSceneDebug(state, metrics) {
        const enabled = Boolean(stateEls.sceneDebugToggle?.checked);
        if (!enabled || !metrics || !state.active_map) {
            stateEls.debugLayer.classList.add('hidden');
            stateEls.debugLayer.innerHTML = '';
            stateEls.sceneDebugInfo.textContent = 'Debug выключен';
            return;
        }

        stateEls.debugLayer.classList.remove('hidden');
        const cols = Math.ceil(metrics.mapWidth / state.grid_cell_size);
        const rows = Math.ceil(metrics.mapHeight / state.grid_cell_size);
        const limit = 500;
        const visibleIcons = state.icons.filter(icon => Number(icon.is_visible) === 1);

        const labels = [];
        for (let y = 0; y < rows; y += 1) {
            for (let x = 0; x < cols; x += 1) {
                if (labels.length >= limit) {
                    break;
                }
                labels.push(`<span class="debug-cell-label" style="left:${x * state.grid_cell_size}px;top:${y * state.grid_cell_size}px">${x},${y}</span>`);
            }
            if (labels.length >= limit) {
                break;
            }
        }

        visibleIcons.forEach(icon => {
            const entity = state.entities.find(e => Number(e.id) === Number(icon.entity_id));
            labels.push(`<div class="debug-icon-box" style="left:${Number(icon.grid_x) * state.grid_cell_size}px;top:${Number(icon.grid_y) * state.grid_cell_size}px;width:${Number(icon.size_cells) * state.grid_cell_size}px;height:${Number(icon.size_cells) * state.grid_cell_size}px">
                <span class="debug-icon-meta">#${icon.id} ${DndCommon.escapeHtml(icon.name || 'Без имени')} (${DndCommon.escapeHtml(formatSideLabel(entity?.side))}) (${icon.grid_x},${icon.grid_y}) size ${icon.size_cells}</span>
            </div>`);
        });

        stateEls.debugLayer.innerHTML = labels.join('');
        stateEls.sceneDebugInfo.innerHTML = [
            `Сцена: ${metrics.mapWidth}x${metrics.mapHeight}px`,
            `Grid cell: ${state.grid_cell_size}px`,
            `Активная карта: ${DndCommon.escapeHtml(state.active_map?.title || '-')}`,
            `Icons state: ${state.icons.length}`,
            `Visible: ${visibleIcons.length}`,
            `DOM rendered: ${metrics.iconStats?.rendered ?? 0}`,
        ].join('<br>');
    }

    function changeInputValue(inputId, delta, min = null, max = null) {
        const input = document.getElementById(inputId);
        if (!input) {
            return;
        }
        const current = Number(input.value || 0);
        let next = current + delta;
        if (min !== null) {
            next = Math.max(min, next);
        }
        if (max !== null) {
            next = Math.min(max, next);
        }
        input.value = String(next);
    }

    async function moveSelectedIcon(dx, dy) {
        if (!selectedIconId || !latestState) {
            return;
        }

        const icon = latestState.icons.find(i => Number(i.id) === Number(selectedIconId));
        if (!icon) {
            return;
        }

        await postForm('/api/move_icon.php', {
            id: selectedIconId,
            grid_x: Math.max(0, Number(icon.grid_x) + dx),
            grid_y: Math.max(0, Number(icon.grid_y) + dy),
        });
    }

    async function resizeSelectedIcon(delta) {
        if (!selectedIconId || !latestState) {
            return;
        }

        const icon = latestState.icons.find(i => Number(i.id) === Number(selectedIconId));
        if (!icon) {
            return;
        }

        const nextSize = Math.min(4, Math.max(1, Number(icon.size_cells) + delta));
        await postForm('/api/update_icon.php', {
            id: selectedIconId,
            grid_x: icon.grid_x,
            grid_y: icon.grid_y,
            size_cells: nextSize,
        });
    }

    function bindForms() {
        const syncMovementModeButton = () => {
            if (!stateEls.movementModeToggle) {
                return;
            }
            stateEls.movementModeToggle.textContent = `Режим перемещения: ${movementModeEnabled ? 'вкл' : 'выкл'}`;
            stateEls.movementModeToggle.classList.toggle('secondary', !movementModeEnabled);
        };
        syncMovementModeButton();

        document.getElementById('btn-mode-prep').onclick = () => postForm('/api/toggle_mode.php', { mode: 'prep' });
        document.getElementById('btn-mode-map').onclick = () => postForm('/api/toggle_mode.php', { mode: 'map' });

        document.getElementById('map-upload-form').addEventListener('submit', async e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await postForm('/api/upload_map.php', fd, true);
            e.currentTarget.reset();
        });

        stateEls.mapList.addEventListener('click', async e => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            pauseUpdates();

            if (target.classList.contains('menu-toggle')) {
                toggleActionMenu(target);
                return;
            }

            if (target.classList.contains('activate-map')) {
                await postForm('/api/update_state.php', { active_map_id: Number(target.dataset.id) });
            }
            if (target.classList.contains('rename-map')) {
                const id = Number(target.dataset.id);
                const currentTitle = target.dataset.title || '';
                const title = prompt('Введите новое название карты', currentTitle);
                if (title !== null && title.trim()) {
                    await postForm('/api/update_map.php', { id, title: title.trim() });
                }
                closeAllActionMenus();
            }
            if (target.classList.contains('delete-map')) {
                const id = Number(target.dataset.id);
                if (confirm('Удалить карту?')) {
                    await postForm('/api/delete_map.php', { id });
                }
                closeAllActionMenus();
            }
        });

        document.getElementById('grid-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            await postForm('/api/update_state.php', {
                grid_cell_size: stateEls.gridCellSize.value,
                grid_enabled: stateEls.gridEnabled.checked ? 1 : 0
            });
            gridFormDirty = false;
            render(await DndCommon.fetchState());
        });

        stateEls.gridEnabled.addEventListener('change', () => {
            gridFormDirty = true;
        });
        stateEls.gridCellSize.addEventListener('input', () => {
            gridFormDirty = true;
        });

        document.getElementById('dc-show-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            const input = document.getElementById('dc-input');
            await postForm('/api/show_dc.php', { dc_value: input.value });
            input.value = '';
        });
        document.getElementById('btn-hide-dc').onclick = () => postForm('/api/hide_dc.php', {});

        stateEls.entityForm.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (!editingEntityId) {
                fd.delete('id');
            }
            await postForm('/api/save_entity.php', fd, true);
            setEntityEditing(null);
        });

        stateEls.entityCancel.addEventListener('click', () => setEntityEditing(null));

        stateEls.entityList.addEventListener('click', async e => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            pauseUpdates();

            if (target.classList.contains('menu-toggle')) {
                toggleActionMenu(target);
                return;
            }

            pauseUpdates();

            if (target.classList.contains('del-entity')) {
                if (confirm('Удалить сущность?')) {
                    await postForm('/api/delete_entity.php', { id: Number(target.dataset.id) });
                }
                closeAllActionMenus();
            }
            if (target.classList.contains('edit-entity')) {
                const id = Number(target.dataset.id);
                const entity = latestState?.entities.find(row => Number(row.id) === id);
                if (entity) {
                    setEntityEditing(entity);
                }
                closeAllActionMenus();
            }
            if (target.classList.contains('quick-add-icon')) {
                await postForm('/api/add_entity_icon.php', { entity_id: Number(target.dataset.id) });
                closeAllActionMenus();
            }
            if (target.classList.contains('duplicate-entity')) {
                await postForm('/api/duplicate_entity.php', { id: Number(target.dataset.id) });
                closeAllActionMenus();
            }
            if (target.classList.contains('toggle-unconscious')) {
                await postForm('/api/save_entity.php', { id: Number(target.dataset.id), is_unconscious: Number(target.dataset.value), name: latestState?.entities.find(row => Number(row.id) === Number(target.dataset.id))?.name, side: latestState?.entities.find(row => Number(row.id) === Number(target.dataset.id))?.side, is_visible: latestState?.entities.find(row => Number(row.id) === Number(target.dataset.id))?.is_visible ? 1 : 0 });
            }
            if (target.classList.contains('hide-entity')) {
                await postForm('/api/hide_entity.php', { id: Number(target.dataset.id) });
                closeAllActionMenus();
            }
            if (target.classList.contains('remove-entity-icons')) {
                await postForm('/api/remove_entity_icons.php', { entity_id: Number(target.dataset.id) });
                closeAllActionMenus();
            }
            if (target.classList.contains('quick-stat')) {
                const payload = { id: Number(target.dataset.id) };
                if (target.dataset.hp) {
                    payload.delta_hp = Number(target.dataset.hp);
                }
                if (target.dataset.ac) {
                    payload.delta_ac = Number(target.dataset.ac);
                }
                await postForm('/api/update_entity_stats.php', payload);
            }
        });


        const onBattleScenarioBlur = () => {
            setTimeout(() => {
                const active = document.activeElement;
                const stillInside = active === stateEls.combatAttacker
                    || active === stateEls.combatTarget
                    || active === stateEls.combatActionType
                    || active === stateEls.battleAttackerEntity
                    || active === stateEls.battleTargetEntity;
                if (!stillInside) {
                    clearBattleScenarioInteraction();
                }
            }, 0);
        };

        [stateEls.combatAttacker, stateEls.combatTarget, stateEls.combatActionType, stateEls.battleAttackerEntity, stateEls.battleTargetEntity].forEach(field => {
            if (!field) {
                return;
            }
            field.addEventListener('focus', markBattleScenarioTouched);
            field.addEventListener('change', markBattleScenarioTouched);
            field.addEventListener('blur', onBattleScenarioBlur);
        });

        stateEls.combatShowBattle?.addEventListener('click', async () => {
            clearBattleScenarioInteraction();
            const attackerId = Number(stateEls.combatAttacker?.value || 0);
            const targetId = Number(stateEls.combatTarget?.value || 0);
            if (!attackerId || !targetId) {
                alert('Выберите атакующего и цель.');
                return;
            }
            await postForm('/api/show_battle_overlay.php', { attacker_entity_id: attackerId, target_entity_id: targetId });
            battleScenarioDraft.attackerEntityId = String(attackerId);
            battleScenarioDraft.targetEntityId = String(targetId);
        });
        stateEls.combatShowDice?.addEventListener('click', async () => {
            clearBattleScenarioInteraction();
            stateEls.battleAttackerEntity.value = stateEls.combatAttacker?.value || '';
            stateEls.battleTargetEntity.value = stateEls.combatTarget?.value || '';
            stateEls.diceEntity.value = stateEls.combatAttacker?.value || '';
            stateEls.diceActionType.value = stateEls.combatActionType?.value || 'custom';
            await stateEls.diceOverlayForm?.requestSubmit();
        });
        stateEls.combatShowResult?.addEventListener('click', async () => {
            clearBattleScenarioInteraction();
            await postForm('/api/show_auto_roll_result.php', {
                action_type: stateEls.combatActionType?.value || 'custom',
                target_entity_id: Number(stateEls.combatTarget?.value || 0) || null,
            });
        });
        stateEls.combatShowDamage?.addEventListener('click', async () => {
            clearBattleScenarioInteraction();
            await postForm('/api/show_roll_result_overlay.php', { result_type: 'damage', title: 'Урон', subtitle: stateEls.diceLabel?.value || '', value_text: `${stateEls.diceTotal?.value || '-'} урона` });
        });
        stateEls.combatHideAll?.addEventListener('click', async () => {
            clearBattleScenarioInteraction();
            await Promise.all([
                postForm('/api/hide_battle_overlay.php', {}),
                postForm('/api/hide_dice_overlay.php', {}),
                postForm('/api/hide_roll_result_overlay.php', {}),
                postForm('/api/hide_dc.php', {}),
            ]);
        });

        stateEls.battleOverlayForm?.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            clearBattleScenarioInteraction();

            const attackerId = Number(stateEls.battleAttackerEntity.value);
            const targetId = Number(stateEls.battleTargetEntity.value);

            if (!attackerId || !targetId) {
                alert('Выберите обе стороны боя.');
                return;
            }

            await postForm('/api/show_battle_overlay.php', {
                attacker_entity_id: attackerId,
                target_entity_id: targetId,
            });
            battleScenarioDraft.attackerEntityId = String(attackerId);
            battleScenarioDraft.targetEntityId = String(targetId);
        });

        stateEls.battleHideButton?.addEventListener('click', async () => {
            pauseUpdates(2200);
            await postForm('/api/hide_battle_overlay.php', {});
        });

        stateEls.diceAddGroupButton?.addEventListener('click', () => {
            diceGroups.push(createDefaultDiceGroup());
            renderDiceGroups();
        });
        stateEls.diceRollMode?.querySelectorAll('input[name="dice_roll_mode"]').forEach(input => {
            input.addEventListener('change', () => {
                diceRollMode = getCurrentDiceRollMode();
                updateDiceModeUI();
                recalculateDiceTotal();
            });
        });
        const onAdvantageInput = () => {
            advantageValues = sanitizeAdvantageValues([
                stateEls.diceAdvantageRoll1?.value,
                stateEls.diceAdvantageRoll2?.value,
            ]);
            recalculateDiceTotal();
        };
        stateEls.diceAdvantageRoll1?.addEventListener('input', onAdvantageInput);
        stateEls.diceAdvantageRoll2?.addEventListener('input', onAdvantageInput);
        stateEls.diceModifier?.addEventListener('input', recalculateDiceTotal);

        document.querySelectorAll('.roll-template').forEach(button => {
            button.addEventListener('click', () => {
                const template = button.dataset.template;
                if (template === '1d20_adv' || template === '1d20_dis') {
                    const value = template === '1d20_adv' ? 'advantage' : 'disadvantage';
                    const radio = stateEls.diceRollMode?.querySelector(`input[value="${value}"]`);
                    if (radio) { radio.checked = true; }
                    diceRollMode = value;
                    advantageValues = [null, null];
                } else {
                    const [countRaw, type] = template.split('d');
                    const count = Number(countRaw) || 1;
                    const radio = stateEls.diceRollMode?.querySelector('input[value="normal"]');
                    if (radio) { radio.checked = true; }
                    diceRollMode = 'normal';
                    diceGroups = [{ dice_type: `d${type}`, dice_count: count, dice_values: Array.from({ length: count }, () => null) }];
                }
                updateDiceModeUI();
                renderDiceGroups();
                recalculateDiceTotal();
            });
        });


        stateEls.diceOverlayForm?.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            const rollMode = getCurrentDiceRollMode();
            let groups = [];
            let validatedAdvantageValues = [];
            try {
                if (rollMode === 'normal') {
                    groups = getValidatedDiceGroups();
                } else {
                    validatedAdvantageValues = getValidatedAdvantageValues();
                }
            } catch (error) {
                alert(error.message || 'Проверьте значения броска.');
                return;
            }

            const modifier = Number(stateEls.diceModifier.value || 0);
            const payload = {
                action_type: (stateEls.diceActionType?.value || 'custom').trim(),
                label: (stateEls.diceLabel.value || '').trim(),
                modifier: Number.isInteger(modifier) ? modifier : 0,
                roll_mode: rollMode,
            };
            if (rollMode === 'normal') {
                payload.groups_json = JSON.stringify(groups);
            } else {
                payload.advantage_values_json = JSON.stringify(validatedAdvantageValues);
            }
            const entityId = Number(stateEls.diceEntity.value || 0);
            if (entityId > 0) {
                payload.entity_id = entityId;
            }

            await postForm('/api/show_dice_overlay.php', payload);
        });

        stateEls.diceHideButton?.addEventListener('click', async () => {
            pauseUpdates(2200);
            await postForm('/api/hide_dice_overlay.php', {});
        });

        stateEls.rollResultOverlayForm?.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();

            const payload = {
                result_type: (stateEls.rollResultType?.value || '').trim(),
                title: (stateEls.rollResultTitle?.value || '').trim(),
                subtitle: (stateEls.rollResultSubtitle?.value || '').trim(),
                value_text: (stateEls.rollResultValueText?.value || '').trim(),
            };
            await postForm('/api/show_roll_result_overlay.php', payload);
        });

        stateEls.rollResultHideButton?.addEventListener('click', async () => {
            pauseUpdates(2200);
            await postForm('/api/hide_roll_result_overlay.php', {});
        });

        document.getElementById('add-icon-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            await postForm('/api/add_icon.php', {
                entity_id: stateEls.addIconEntity.value,
                grid_x: stateEls.addIconGridX.value,
                grid_y: stateEls.addIconGridY.value,
                size_cells: stateEls.addIconSizeCells.value
            });
        });

        stateEls.selectedIconForm.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            if (!selectedIconId) {
                return;
            }
            await postForm('/api/update_icon.php', {
                id: selectedIconId,
                grid_x: stateEls.selectedIconGridX.value,
                grid_y: stateEls.selectedIconGridY.value,
                size_cells: stateEls.selectedIconSizeCells.value,
            });
        });

        stateEls.selectedIconDelete.addEventListener('click', async () => {
            pauseUpdates(2200);
            if (!selectedIconId) {
                return;
            }
            if (confirm('Удалить иконку?')) {
                await postForm('/api/delete_icon.php', { id: selectedIconId });
                setSelectedIcon(null);
            }
        });
        stateEls.selectedIconCenter.addEventListener('click', async () => {
            pauseUpdates(2200);
            if (!selectedIconId) {
                return;
            }
            await centerIconById(selectedIconId);
        });

        stateEls.selectedIconShowRange?.addEventListener('click', async () => {
            pauseUpdates(2200);
            if (!selectedIconId) {
                return;
            }
            await postForm('/api/show_ability_range.php', {
                icon_id: selectedIconId,
                range_cells: Math.max(1, Number(stateEls.selectedIconRange?.value || 1)),
            });
        });

        stateEls.selectedIconHideRange?.addEventListener('click', async () => {
            pauseUpdates(2200);
            await postForm('/api/hide_ability_range.php', {});
        });

        stateEls.sceneIconsList.addEventListener('click', async e => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const iconId = Number(target.dataset.id);
            if (!iconId) {
                return;
            }

            if (target.classList.contains('scene-select')) {
                const icon = latestState?.icons.find(i => Number(i.id) === iconId) || null;
                if (icon) {
                    setSelectedIcon(icon);
                    render(latestState);
                }
                return;
            }

            if (target.classList.contains('scene-center')) {
                pauseUpdates(2200);
                await centerIconById(iconId);
                return;
            }

            if (target.classList.contains('scene-delete')) {
                pauseUpdates(2200);
                if (confirm('Удалить иконку?')) {
                    await postForm('/api/delete_icon.php', { id: iconId });
                    if (selectedIconId === iconId) {
                        setSelectedIcon(null);
                    }
                }
            }
        });

        document.querySelectorAll('.icon-step').forEach(btn => {
            btn.addEventListener('click', async () => {
                pauseUpdates(2200);
                const dir = btn.dataset.dir;
                const shifts = {
                    left: [-1, 0],
                    right: [1, 0],
                    up: [0, -1],
                    down: [0, 1],
                };
                const [dx, dy] = shifts[dir] || [0, 0];
                await moveSelectedIcon(dx, dy);
            });
        });

        document.querySelectorAll('.icon-size-step').forEach(btn => {
            btn.addEventListener('click', async () => {
                pauseUpdates(2200);
                await resizeSelectedIcon(Number(btn.dataset.delta || 0));
            });
        });

        stateEls.entityForm.querySelectorAll('.quick-adjust').forEach(button => {
            button.addEventListener('click', () => {
                pauseUpdates(3000);
                const targetId = button.dataset.target;
                const delta = Number(button.dataset.delta || 0);
                changeInputValue(targetId, delta, 0);
            });
        });

        stateEls.mapStage.addEventListener('click', e => {
            pauseUpdates(1200);
            if (e.target === stateEls.iconsLayer || e.target === stateEls.gridLayer || e.target === stateEls.mapImage || e.target === stateEls.sceneLayer || e.target === stateEls.mapStage) {
                setSelectedIcon(null);
            }
        });

        document.addEventListener('click', e => {
            if (!(e.target instanceof Element) || !e.target.closest('.item-menu')) {
                closeAllActionMenus();
            }
        });


        document.querySelector('.master-controls')?.addEventListener('pointerdown', () => {
            pauseUpdates(2500);
        });

        stateEls.sceneDebugToggle?.addEventListener('change', () => {
            if (latestState) {
                render(latestState);
            }
        });

        stateEls.movementModeToggle?.addEventListener('click', () => {
            movementModeEnabled = !movementModeEnabled;
            hoverCell = null;
            syncMovementModeButton();
            if (latestState) {
                render(latestState);
            }
        });

        stateEls.movementDebugToggle?.addEventListener('change', () => {
            if (latestState) {
                render(latestState);
            }
        });

        stateEls.sceneLayer.addEventListener('mousemove', e => {
            if (!latestState || !movementModeEnabled) {
                return;
            }
            hoverCell = toSceneCell(e, latestState);
            renderHoverPreview(latestState, getSelectedIcon(latestState));
        });
        stateEls.sceneLayer.addEventListener('mouseleave', () => {
            hoverCell = null;
            stateEls.hoverLayer.innerHTML = '';
        });
        stateEls.sceneLayer.addEventListener('dragover', e => {
            if (!latestState || !movementModeEnabled) {
                return;
            }
            hoverCell = toSceneCell(e, latestState);
            renderHoverPreview(latestState, getSelectedIcon(latestState));
        });
        stateEls.sceneLayer.addEventListener('dragleave', () => {
            if (!movementModeEnabled) {
                return;
            }
            hoverCell = null;
            stateEls.hoverLayer.innerHTML = '';
        });

        if (!diceGroups.length) {
            diceGroups = [createDefaultDiceGroup()];
        }
        diceRollMode = getCurrentDiceRollMode();
        updateDiceModeUI();
        renderDiceGroups();

        const notes = document.getElementById('notes');
        notes.value = localStorage.getItem('master_notes') || '';
        notes.addEventListener('input', () => localStorage.setItem('master_notes', notes.value));
    }

    function initPanelCollapse() {
        document.querySelectorAll('.master-controls .panel').forEach(panel => {
            const title = panel.querySelector('h3');
            if (!title) {
                return;
            }

            let content = panel.querySelector(':scope > .panel-content');
            if (!content) {
                content = document.createElement('div');
                content.className = 'panel-content';
                const nodes = Array.from(panel.children).filter(node => node !== title);
                nodes.forEach(node => content.appendChild(node));
                panel.appendChild(content);
            }

            const defaultOpen = panel.dataset.defaultOpen === 'true';
            panel.classList.toggle('is-collapsed', !defaultOpen);
            title.setAttribute('tabindex', '0');
            title.setAttribute('role', 'button');
            title.setAttribute('aria-expanded', defaultOpen ? 'true' : 'false');

            const toggle = () => {
                const collapsed = panel.classList.toggle('is-collapsed');
                title.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            };

            title.addEventListener('click', toggle);
            title.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });
        });
    }

    initPanelCollapse();
    bindForms();
    DndCommon.startPolling(render, 700);
})();
