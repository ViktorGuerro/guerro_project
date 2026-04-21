(function () {
    const stage = document.getElementById('players-stage');
    const placeholder = document.getElementById('players-placeholder');
    const sceneLayer = document.getElementById('players-scene-layer');
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
        DndCommon.renderScene({
            stage,
            sceneLayer,
            mapImage,
            gridLayer,
            iconsLayer,
            mapPath: state.active_map.file_path,
            gridEnabled: state.grid_enabled,
            activeMap: state.active_map,
            icons: state.icons,
        });
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
