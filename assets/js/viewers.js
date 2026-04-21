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
    const diceOverlayDiceList = document.getElementById('dice-overlay-dice-list');
    const diceOverlaySummary = document.getElementById('dice-overlay-summary');
    const rollResultOverlay = document.getElementById('roll-result-overlay');
    const rollResultTitle = document.getElementById('roll-result-title');
    const rollResultSubtitle = document.getElementById('roll-result-subtitle');
    const rollResultValue = document.getElementById('roll-result-value');

    let lastDiceSignature = null;

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
            ac.textContent = entity.armor_class ?? '-';
            hp.textContent = `${entity.hp_current ?? '-'}${entity.hp_max !== null ? `/${entity.hp_max}` : ''}`;
        };

        renderBattleSide(overlayData.attacker, battleAttackerBlock, battleOverlayAttackerImage, battleOverlayAttackerName, battleOverlayAttackerAc, battleOverlayAttackerHp);
        renderBattleSide(overlayData.target, battleTargetBlock, battleOverlayTargetImage, battleOverlayTargetName, battleOverlayTargetAc, battleOverlayTargetHp);

        battleOverlay.classList.toggle('hidden', !Boolean(overlayData.attacker || overlayData.target));
    }

    function renderDiceOverlay(state) {
        const overlay = state.dice_overlay;
        if (!overlay?.active) {
            diceOverlay.classList.add('hidden');
            diceOverlayDiceList.innerHTML = '';
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

        const groupsSummary = isSpecialMode
            ? `${rollMode === 'advantage' ? 'Преимущество' : 'Помеха'} • d20: ${(advantageValues || []).join(' / ')}`
            : groups.map(group => `${group.dice_count}${group.dice_type}: ${(group.dice_values || []).join(' + ')}`).join(' • ');
        const modifierLabel = overlay.modifier ? ` ${overlay.modifier > 0 ? '+' : '-'} ${Math.abs(overlay.modifier)}` : '';
        const criticalLabel = overlay.critical_state === 'success'
            ? ' • Критический успех'
            : overlay.critical_state === 'fail'
                ? ' • Критический провал'
                : '';

        diceOverlaySummary.textContent = `${groupsSummary}${modifierLabel ? ` ${modifierLabel}` : ''} • Σ ${overlay.total_value ?? '-'}${criticalLabel}`;
        diceOverlaySummary.classList.toggle('crit-success', overlay.critical_state === 'success');
        diceOverlaySummary.classList.toggle('crit-fail', overlay.critical_state === 'fail');

        if (signature !== lastDiceSignature) {
            diceOverlayDiceList.innerHTML = '';
            let tileOffset = 0;

            if (isSpecialMode) {
                const modeBadge = document.createElement('div');
                modeBadge.className = 'dice-roll-mode-badge';
                modeBadge.textContent = rollMode === 'advantage' ? 'Преимущество' : 'Помеха';
                diceOverlayDiceList.appendChild(modeBadge);

                const specialWrap = document.createElement('div');
                specialWrap.className = 'dice-special-tiles';
                const selectedRoll = Number(overlay.selected_roll);
                advantageValues.forEach((value, index) => {
                    const tile = document.createElement('div');
                    const isSelected = Number(value) === selectedRoll;
                    tile.className = `dice-tile rolling ${isSelected ? 'selected' : 'unselected'}`;
                    tile.style.animationDelay = `${index * 100}ms`;
                    if (selectedRoll === 20 && isSelected) {
                        tile.classList.add('crit-success');
                    }
                    if (selectedRoll === 1 && isSelected) {
                        tile.classList.add('crit-fail');
                    }

                    const type = document.createElement('div');
                    type.className = 'dice-type';
                    type.textContent = 'd20';
                    const val = document.createElement('div');
                    val.className = 'dice-value';
                    val.textContent = '?';
                    const mark = document.createElement('div');
                    mark.className = 'dice-picked-mark';
                    mark.textContent = isSelected ? 'В расчёт' : 'Не выбран';
                    tile.appendChild(type);
                    tile.appendChild(val);
                    tile.appendChild(mark);
                    specialWrap.appendChild(tile);

                    setTimeout(() => {
                        val.textContent = String(value);
                        tile.classList.remove('rolling');
                    }, 600 + index * 120);
                });
                diceOverlayDiceList.appendChild(specialWrap);
            } else {
                groups.forEach((group, groupIndex) => {
                const groupWrap = document.createElement('div');
                groupWrap.className = 'dice-group-view';

                const groupTitle = document.createElement('div');
                groupTitle.className = 'dice-group-title';
                groupTitle.textContent = `${group.dice_count}${group.dice_type}`;
                groupWrap.appendChild(groupTitle);

                const groupTiles = document.createElement('div');
                groupTiles.className = 'dice-group-tiles';

                (group.dice_values || []).forEach((value, index) => {
                    const tile = document.createElement('div');
                    tile.className = 'dice-tile rolling';
                    tile.style.animationDelay = `${tileOffset * 70}ms`;

                    const isCritSuccess = group.dice_type === 'd20' && Number(value) === 20;
                    const isCritFail = group.dice_type === 'd20' && Number(value) === 1;
                    if (isCritSuccess) {
                        tile.classList.add('crit-success');
                    }
                    if (isCritFail) {
                        tile.classList.add('crit-fail');
                    }

                    const type = document.createElement('div');
                    type.className = 'dice-type';
                    type.textContent = group.dice_type || '';
                    const val = document.createElement('div');
                    val.className = 'dice-value';
                    val.textContent = '?';
                    tile.appendChild(type);
                    tile.appendChild(val);
                    groupTiles.appendChild(tile);

                    setTimeout(() => {
                        val.textContent = String(value);
                        tile.classList.remove('rolling');
                    }, 600 + tileOffset * 100);

                    tileOffset += 1;
                });

                groupWrap.appendChild(groupTiles);
                diceOverlayDiceList.appendChild(groupWrap);

                if (groupIndex < groups.length - 1) {
                    const separator = document.createElement('div');
                    separator.className = 'dice-group-separator';
                    separator.textContent = '+';
                    diceOverlayDiceList.appendChild(separator);
                }
                });
            }

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
