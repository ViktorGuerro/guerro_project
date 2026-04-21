(function () {
    const stage = document.getElementById('viewers-stage');
    const placeholder = document.getElementById('viewers-placeholder');
    const mapImage = document.getElementById('viewers-map-image');
    const gridLayer = document.getElementById('viewers-grid-layer');
    const iconsLayer = document.getElementById('viewers-icons-layer');
    const dcBox = document.getElementById('dc-box');

    function render(state) {
        if (state.mode === 'prep' || !state.active_map) {
            placeholder.classList.remove('hidden');
            stage.classList.add('hidden');
        } else {
            placeholder.classList.add('hidden');
            stage.classList.remove('hidden');

            mapImage.src = state.active_map.file_path;

            DndCommon.renderGrid(gridLayer, state.grid_cell_size, state.grid_enabled);
            DndCommon.renderIcons(iconsLayer, state.icons, state.grid_cell_size);
        }

        if (state.dc_visible && state.dc_value !== null) {
            dcBox.classList.remove('hidden');
            dcBox.textContent = `СЛ ${state.dc_value}`;
        } else {
            dcBox.classList.add('hidden');
        }
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
