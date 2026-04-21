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
    const battleOverlayImage = document.getElementById('battle-overlay-image');
    const battleOverlayName = document.getElementById('battle-overlay-name');
    const battleOverlayAc = document.getElementById('battle-overlay-ac');
    const battleOverlayHp = document.getElementById('battle-overlay-hp');

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
        if (!overlayData?.active || !overlayData.entity) {
            battleOverlay.classList.add('hidden');
            return;
        }

        const entity = overlayData.entity;
        battleOverlay.classList.remove('hidden');
        battleOverlayImage.src = entity.image_path || '';
        battleOverlayImage.alt = entity.name || '';
        battleOverlayName.textContent = entity.name || 'Без имени';
        battleOverlayAc.textContent = entity.armor_class ?? '-';
        battleOverlayHp.textContent = `${entity.hp_current ?? '-'}${entity.hp_max !== null ? `/${entity.hp_max}` : ''}`;
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
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
