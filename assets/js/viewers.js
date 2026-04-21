(function () {
    const stage = document.getElementById('viewers-stage');
    const placeholder = document.getElementById('viewers-placeholder');
    const sceneLayer = document.getElementById('viewers-scene-layer');
    const mapImage = document.getElementById('viewers-map-image');
    const gridLayer = document.getElementById('viewers-grid-layer');
    const iconsLayer = document.getElementById('viewers-icons-layer');
    const abilityLayer = document.getElementById('viewers-ability-overlay-layer');
    const dcBox = document.getElementById('dc-box');
    const dcValue = document.getElementById('dc-value');
    const battleOverlay = document.getElementById('battle-overlay');
    const battleAttackerBlock = document.getElementById('battle-overlay-attacker');
    const battleTargetBlock = document.getElementById('battle-overlay-target');
    const battleOverlayAttackerImage = document.getElementById('battle-overlay-attacker-image');
    const battleOverlayAttackerName = document.getElementById('battle-overlay-attacker-name');
    const battleOverlayAttackerAc = document.getElementById('battle-overlay-attacker-ac');
    const battleOverlayAttackerHp = document.getElementById('battle-overlay-attacker-hp');
    const battleOverlayTargetImage = document.getElementById('battle-overlay-target-image');
    const battleOverlayTargetName = document.getElementById('battle-overlay-target-name');
    const battleOverlayTargetAc = document.getElementById('battle-overlay-target-ac');
    const battleOverlayTargetHp = document.getElementById('battle-overlay-target-hp');
    const diceOverlay = document.getElementById('dice-overlay');
    const diceOverlayActor = document.getElementById('dice-overlay-actor');
    const diceOverlayLabel = document.getElementById('dice-overlay-label');
    const diceOverlayModeBadge = document.getElementById('dice-overlay-mode-badge');
    const diceOverlayDiceList = document.getElementById('dice-overlay-dice-list');
    const diceOverlayModifier = document.getElementById('dice-overlay-modifier');
    const diceOverlayTotal = document.getElementById('dice-overlay-total');
    const diceOverlayCritical = document.getElementById('dice-overlay-critical');
    const rollResultOverlay = document.getElementById('roll-result-overlay');
    const rollResultTitle = document.getElementById('roll-result-title');
    const rollResultSubtitle = document.getElementById('roll-result-subtitle');
    const rollResultValue = document.getElementById('roll-result-value');

    let lastDiceSignature = null;
    let diceAnimationTimers = [];

    function renderAbilityCircle(state) {
        abilityLayer.innerHTML = '';
        const overlay = state.ability_overlay;
        if (!overlay?.active || !overlay.icon_id || !overlay.range_cells) {
            return;
        }

        const icon = (state.icons || []).find(row => Number(row.id) === Number(overlay.icon_id));
        if (!icon) {
            return;
        }

        const cellSize = Number(state.grid_cell_size) || 70;
        const rangeCells = Math.max(1, Number(overlay.range_cells) || 1);
        const iconSizeCells = Math.max(1, Number(icon.size_cells) || 1);

        const centerX = Number(icon.grid_x) * cellSize + (iconSizeCells * cellSize) / 2;
        const centerY = Number(icon.grid_y) * cellSize + (iconSizeCells * cellSize) / 2;
        const radiusPx = rangeCells * cellSize;

        const circle = document.createElement('div');
        circle.className = 'ability-circle';
        circle.style.width = `${radiusPx * 2}px`;
        circle.style.height = `${radiusPx * 2}px`;
        circle.style.left = `${centerX - radiusPx}px`;
        circle.style.top = `${centerY - radiusPx}px`;
        abilityLayer.appendChild(circle);
    }

    function renderBattleOverlay(state) {
        const overlayData = state.battle_overlay;
        if (!overlayData?.active) {
            battleOverlay.classList.add('hidden');
            return;
        }

        const renderBattleSide = (entity, sideBlock, image, name, ac, hp) => {
            if (!entity) {
                sideBlock.classList.add('hidden');
                return;
            }
            sideBlock.classList.remove('hidden');
            image.src = entity.image_path || '';
            image.alt = entity.name || '';
            name.textContent = entity.name || 'Без имени';
            image.classList.toggle('is-unconscious', Number(entity.is_unconscious) === 1);
            ac.textContent = entity.armor_class ?? '-';
            hp.textContent = `${entity.hp_current ?? '-'}${entity.hp_max !== null ? `/${entity.hp_max}` : ''}`;
        };

        renderBattleSide(overlayData.attacker, battleAttackerBlock, battleOverlayAttackerImage, battleOverlayAttackerName, battleOverlayAttackerAc, battleOverlayAttackerHp);
        renderBattleSide(overlayData.target, battleTargetBlock, battleOverlayTargetImage, battleOverlayTargetName, battleOverlayTargetAc, battleOverlayTargetHp);

        battleOverlay.classList.toggle('hidden', !Boolean(overlayData.attacker || overlayData.target));
    }

    function clearDiceAnimationTimers() {
        diceAnimationTimers.forEach(timer => clearTimeout(timer));
        diceAnimationTimers = [];
    }

    function createDiceTile({ diceType, value, modeClass = '', isSelected = false, isCritSuccess = false, isCritFail = false }) {
        const tile = document.createElement('div');
        tile.className = `dice-tile rolling ${modeClass}`.trim();
        if (isSelected) {
            tile.classList.add('selected');
        } else if (modeClass) {
            tile.classList.add('unselected');
        }
        if (isCritSuccess) {
            tile.classList.add('crit-success');
        }
        if (isCritFail) {
            tile.classList.add('crit-fail');
        }

        const inner = document.createElement('div');
        inner.className = 'dice-tile-inner';
        const type = document.createElement('div');
        type.className = 'dice-type';
        type.textContent = diceType;
        const valueEl = document.createElement('div');
        valueEl.className = 'dice-value';
        valueEl.textContent = '?';
        inner.appendChild(type);
        inner.appendChild(valueEl);
        tile.appendChild(inner);

        return { tile, valueEl, finalValue: value };
    }

    function buildDiceVisuals(overlay) {
        const rollMode = overlay.roll_mode || 'normal';
        const visuals = [];

        if (rollMode === 'advantage' || rollMode === 'disadvantage') {
            const selectedRoll = Number(overlay.selected_roll);
            const values = Array.isArray(overlay.advantage_values) ? overlay.advantage_values : [];
            values.forEach(value => {
                const numericValue = Number(value);
                const isSelected = Number.isFinite(numericValue) && numericValue === selectedRoll;
                visuals.push({
                    diceType: 'd20',
                    value: Number.isFinite(numericValue) ? numericValue : '-',
                    modeClass: rollMode === 'advantage' ? 'mode-advantage' : 'mode-disadvantage',
                    isSelected,
                    isCritSuccess: isSelected && selectedRoll === 20,
                    isCritFail: isSelected && selectedRoll === 1,
                });
            });
            return visuals;
        }

        const groups = Array.isArray(overlay.groups) ? overlay.groups : [];
        groups.forEach(group => {
            const diceType = group.dice_type || 'd6';
            const values = Array.isArray(group.dice_values) ? group.dice_values : [];
            values.forEach(value => {
                const numericValue = Number(value);
                visuals.push({
                    diceType,
                    value: Number.isFinite(numericValue) ? numericValue : '-',
                    isCritSuccess: diceType === 'd20' && numericValue === 20,
                    isCritFail: diceType === 'd20' && numericValue === 1,
                });
            });
        });
        return visuals;
    }

    function runDiceAnimation(tiles) {
        clearDiceAnimationTimers();
        tiles.forEach((tileData, index) => {
            tileData.tile.style.animationDelay = `${index * 85}ms`;
            const rollingSwapTimer = setTimeout(() => {
                if (!document.body.contains(tileData.valueEl)) {
                    return;
                }
                const max = Number(String(tileData.tile.querySelector('.dice-type')?.textContent || '').replace('d', '')) || 20;
                tileData.valueEl.textContent = String(Math.max(1, Math.min(max, ((index + 3) * 7) % max || max)));
            }, 220 + index * 35);
            const settleTimer = setTimeout(() => {
                if (!document.body.contains(tileData.valueEl)) {
                    return;
                }
                tileData.valueEl.textContent = String(tileData.finalValue);
                tileData.tile.classList.remove('rolling');
                tileData.tile.classList.add('settled');
            }, 900 + index * 90);
            diceAnimationTimers.push(rollingSwapTimer, settleTimer);
        });
    }

    function renderDiceOverlay(state) {
        const overlay = state.dice_overlay;
        if (!overlay?.active) {
            diceOverlay.classList.add('hidden');
            diceOverlayDiceList.innerHTML = '';
            clearDiceAnimationTimers();
            lastDiceSignature = null;
            return;
        }

        const groups = Array.isArray(overlay.groups) ? overlay.groups : [];
        const rollMode = overlay.roll_mode || 'normal';
        const isSpecialMode = rollMode === 'advantage' || rollMode === 'disadvantage';
        const advantageValues = Array.isArray(overlay.advantage_values) ? overlay.advantage_values : [];
        const signature = JSON.stringify({
            entityId: overlay.entity?.id || null,
            label: overlay.label || '',
            rollMode,
            groups,
            advantageValues,
            selectedRoll: overlay.selected_roll ?? null,
            modifier: overlay.modifier || 0,
            total: overlay.total_value || 0,
            criticalState: overlay.critical_state || 'none',
        });

        diceOverlayActor.textContent = overlay.entity?.name || 'Без сущности';
        diceOverlayLabel.textContent = overlay.label || 'Бросок';

        const modifier = Number(overlay.modifier || 0);
        diceOverlayModifier.textContent = `Модификатор: ${modifier >= 0 ? '+' : '−'}${Math.abs(modifier)}`;
        diceOverlayTotal.textContent = `Итог: ${overlay.total_value ?? '-'}`;
        diceOverlayTotal.classList.toggle('crit-success', overlay.critical_state === 'success');
        diceOverlayTotal.classList.toggle('crit-fail', overlay.critical_state === 'fail');

        if (isSpecialMode) {
            diceOverlayModeBadge.textContent = rollMode === 'advantage' ? 'Преимущество' : 'Помеха';
            diceOverlayModeBadge.className = `dice-overlay-mode-badge ${rollMode === 'advantage' ? 'mode-advantage' : 'mode-disadvantage'}`;
        } else {
            diceOverlayModeBadge.textContent = '';
            diceOverlayModeBadge.className = 'dice-overlay-mode-badge hidden';
        }

        if (overlay.critical_state === 'success') {
            diceOverlayCritical.textContent = 'Критический успех';
            diceOverlayCritical.className = 'dice-overlay-critical crit-success';
        } else if (overlay.critical_state === 'fail') {
            diceOverlayCritical.textContent = 'Критический провал';
            diceOverlayCritical.className = 'dice-overlay-critical crit-fail';
        } else {
            diceOverlayCritical.textContent = '';
            diceOverlayCritical.className = 'dice-overlay-critical hidden';
        }

        if (signature !== lastDiceSignature) {
            diceOverlayDiceList.innerHTML = '';
            const visuals = buildDiceVisuals(overlay);
            const tileRefs = visuals.map(config => createDiceTile(config));
            tileRefs.forEach(tileRef => diceOverlayDiceList.appendChild(tileRef.tile));
            runDiceAnimation(tileRefs);

            lastDiceSignature = signature;
        }

        diceOverlay.classList.remove('hidden');
    }

    function renderRollResultOverlay(state) {
        const overlay = state.roll_result_overlay;
        if (!overlay?.active) {
            rollResultOverlay.classList.add('hidden');
            rollResultOverlay.className = 'roll-result-overlay hidden';
            return;
        }

        rollResultTitle.textContent = overlay.title || '';
        rollResultSubtitle.textContent = overlay.subtitle || '';
        rollResultValue.textContent = overlay.value_text || '';
        rollResultSubtitle.classList.toggle('hidden', !overlay.subtitle);
        rollResultValue.classList.toggle('hidden', !overlay.value_text);
        rollResultOverlay.className = `roll-result-overlay result-${overlay.result_type || 'custom'}`;
    }


    function render(state) {
        if (state.mode === 'prep' || !state.active_map) {
            placeholder.classList.remove('hidden');
            stage.classList.add('hidden');
        } else {
            placeholder.classList.add('hidden');
            stage.classList.remove('hidden');

            DndCommon.renderScene({
                stage,
                sceneLayer,
                mapImage,
                gridLayer,
                iconsLayer,
                mapPath: state.active_map.file_path,
                gridCellSize: state.grid_cell_size,
                gridEnabled: state.grid_enabled,
                icons: state.icons,
            });
            renderAbilityCircle(state);
        }

        if (state.dc_visible && state.dc_value !== null) {
            dcBox.classList.remove('hidden');
            dcValue.textContent = String(state.dc_value);
        } else {
            dcBox.classList.add('hidden');
        }

        renderBattleOverlay(state);
        renderDiceOverlay(state);
        renderRollResultOverlay(state);
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
