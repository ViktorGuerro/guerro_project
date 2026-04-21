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

        const signature = JSON.stringify({
            entityId: overlay.entity?.id || null,
            label: overlay.label || '',
            diceType: overlay.dice_type || '',
            values: overlay.dice_values || [],
            modifier: overlay.modifier || 0,
            total: overlay.total_value || 0,
        });

        diceOverlayActor.textContent = overlay.entity?.name || 'Без сущности';
        diceOverlayLabel.textContent = overlay.label || 'Бросок';
        diceOverlaySummary.textContent = `Σ ${overlay.total_value ?? '-'} (${(overlay.dice_values || []).join(' + ')}${overlay.modifier ? ` ${overlay.modifier > 0 ? '+' : '-'} ${Math.abs(overlay.modifier)}` : ''})`;

        if (signature !== lastDiceSignature) {
            diceOverlayDiceList.innerHTML = '';
            (overlay.dice_values || []).forEach((value, index) => {
                const tile = document.createElement('div');
                tile.className = 'dice-tile rolling';
                tile.style.animationDelay = `${index * 90}ms`;
                const type = document.createElement('div');
                type.className = 'dice-type';
                type.textContent = overlay.dice_type || '';
                const val = document.createElement('div');
                val.className = 'dice-value';
                val.textContent = '?';
                tile.appendChild(type);
                tile.appendChild(val);
                diceOverlayDiceList.appendChild(tile);

                setTimeout(() => {
                    val.textContent = String(value);
                    tile.classList.add('revealed');
                    tile.classList.remove('rolling');
                }, 650 + index * 120);
            });
            lastDiceSignature = signature;
        }

        diceOverlay.classList.remove('hidden');
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
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
