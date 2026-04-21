(function () {
    const stage = document.getElementById('viewers-stage');
    const placeholder = document.getElementById('viewers-placeholder');
    const mapImage = document.getElementById('viewers-map-image');
    const gridLayer = document.getElementById('viewers-grid-layer');
    const iconsLayer = document.getElementById('viewers-icons-layer');
    const dcBox = document.getElementById('dc-box');
    const sidebar = document.getElementById('viewer-sidebar');

    function renderCards(state) {
        const visible = state.entities.filter(e => e.is_visible);
        sidebar.innerHTML = visible.map(e => `
            <div class="entity-card">
                ${e.image_path ? `<img src="${e.image_path}" alt="">` : '<div class="placeholder">?</div>'}
                <div>
                    <div><strong>${DndCommon.escapeHtml(e.name)}</strong></div>
                    <div>КД: ${e.armor_class ?? '-'}</div>
                    <div>ХП: ${e.hp_current ?? '-'} / ${e.hp_max ?? '-'}</div>
                </div>
            </div>
        `).join('');
    }

    function render(state) {
        renderCards(state);
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
