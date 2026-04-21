(function () {
    const stage = document.getElementById('viewers-stage');
    const placeholder = document.getElementById('viewers-placeholder');
    const sceneLayer = document.getElementById('viewers-scene-layer');
    const mapImage = document.getElementById('viewers-map-image');
    const gridLayer = document.getElementById('viewers-grid-layer');
    const iconsLayer = document.getElementById('viewers-icons-layer');
    const dcBox = document.getElementById('dc-box');
    const dcValue = document.getElementById('dc-value');

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
                gridEnabled: state.grid_enabled,
                activeMap: state.active_map,
                icons: state.icons,
            });
        }

        if (state.dc_visible && state.dc_value !== null) {
            dcBox.classList.remove('hidden');
            dcValue.textContent = String(state.dc_value);
        } else {
            dcBox.classList.add('hidden');
        }
    }

    DndCommon.startPolling(render, 700);

    document.getElementById('btn-refresh').addEventListener('click', async () => render(await DndCommon.fetchState()));
    document.getElementById('btn-fullscreen').addEventListener('click', () => document.documentElement.requestFullscreen?.());
})();
