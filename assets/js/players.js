(function () {
    const stage = document.getElementById('players-stage');
    const placeholder = document.getElementById('players-placeholder');
    const mapImage = document.getElementById('players-map-image');
    const gridLayer = document.getElementById('players-grid-layer');
    const iconsLayer = document.getElementById('players-icons-layer');

    function render(state) {
        if (state.mode === 'prep' || !state.active_map) {
            placeholder.classList.remove('hidden');
            stage.classList.add('hidden');
            return;
        }

        placeholder.classList.add('hidden');
        stage.classList.remove('hidden');
        mapImage.src = state.active_map.file_path;
        DndCommon.renderGrid(gridLayer, state.grid_cell_size, state.grid_enabled);
        DndCommon.renderIcons(iconsLayer, state.icons, state.grid_cell_size, {});
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
