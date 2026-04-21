(function () {
    const stage = document.getElementById('players-stage');
    const placeholder = document.getElementById('players-placeholder');
    const sceneLayer = document.getElementById('players-scene-layer');
    const mapImage = document.getElementById('players-map-image');
    const gridLayer = document.getElementById('players-grid-layer');
    const iconsLayer = document.getElementById('players-icons-layer');
    const abilityLayer = document.getElementById('players-ability-overlay-layer');

    function renderAbilityCells(state) {
        abilityLayer.innerHTML = '';
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
                abilityLayer.appendChild(cell);
            }
        }
    }

    function render(state) {
        if (state.mode === 'prep' || !state.active_map) {
            placeholder.classList.remove('hidden');
            stage.classList.add('hidden');
            return;
        }

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
        renderAbilityCells(state);
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
