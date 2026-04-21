(function () {
    const stateEls = {
        mapImage: document.getElementById('master-map-image'),
        gridLayer: document.getElementById('master-grid-layer'),
        iconsLayer: document.getElementById('master-icons-layer'),
        gridEnabled: document.getElementById('grid-enabled'),
        gridCellSize: document.getElementById('grid-cell-size'),
        mapList: document.getElementById('map-list'),
        entityList: document.getElementById('entity-list'),
        addIconEntity: document.getElementById('add-icon-entity')
    };

    let latestState = null;

    async function postForm(url, entries, isMultipart = false) {
        const form = isMultipart ? entries : new FormData();
        if (!isMultipart) {
            Object.entries(entries).forEach(([k, v]) => form.append(k, v));
        }
        const payload = await DndCommon.apiPost(url, form);
        if (!payload.ok) throw new Error(payload.error || 'api_error');
        return payload.data;
    }

    function fillMapList(state) {
        DndCommon.apiGet('/api/list_maps.php').then(payload => {
            const maps = payload.ok ? payload.data.maps : [];
            stateEls.mapList.innerHTML = maps.map(m => `<div class="map-list-item">
                <span>${DndCommon.escapeHtml(m.title)}</span>
                <button data-id="${m.id}" class="activate-map">${m.is_active ? 'Активна' : 'Сделать активной'}</button>
            </div>`).join('');
        });
    }

    function fillEntityList(state) {
        const entities = state.entities;
        stateEls.entityList.innerHTML = entities.map(e => `<div class="entity-list-item">
            <span>${DndCommon.escapeHtml(e.name)} (${e.side})</span>
            <button class="danger del-entity" data-id="${e.id}">Удалить</button>
        </div>`).join('');
        stateEls.addIconEntity.innerHTML = entities.map(e => `<option value="${e.id}">${DndCommon.escapeHtml(e.name)}</option>`).join('');
    }

    function render(state) {
        latestState = state;
        fillMapList(state);
        fillEntityList(state);
        if (state.active_map) {
            stateEls.mapImage.src = state.active_map.file_path;
        }
        stateEls.gridEnabled.checked = Boolean(state.grid_enabled);
        stateEls.gridCellSize.value = state.grid_cell_size;
        DndCommon.renderGrid(stateEls.gridLayer, state.grid_cell_size, state.grid_enabled);
        DndCommon.renderIcons(stateEls.iconsLayer, state.icons, state.grid_cell_size, true, async e => {
            e.preventDefault();
            const id = Number(e.dataTransfer.getData('text/plain'));
            const rect = stateEls.iconsLayer.getBoundingClientRect();
            const x = Math.max(0, Math.round((e.clientX - rect.left) / state.grid_cell_size));
            const y = Math.max(0, Math.round((e.clientY - rect.top) / state.grid_cell_size));
            await postForm('/api/move_icon.php', { id, grid_x: x, grid_y: y });
            render(await DndCommon.fetchState());
        });
    }

    function bindForms() {
        document.getElementById('btn-mode-prep').onclick = () => postForm('/api/toggle_mode.php', { mode: 'prep' });
        document.getElementById('btn-mode-map').onclick = () => postForm('/api/toggle_mode.php', { mode: 'map' });

        document.getElementById('map-upload-form').addEventListener('submit', async e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await postForm('/api/upload_map.php', fd, true);
            e.currentTarget.reset();
        });

        document.getElementById('map-list').addEventListener('click', async e => {
            if (e.target.classList.contains('activate-map')) {
                await postForm('/api/update_state.php', { active_map_id: Number(e.target.dataset.id) });
            }
        });

        document.getElementById('grid-form').addEventListener('submit', async e => {
            e.preventDefault();
            await postForm('/api/update_state.php', {
                grid_cell_size: stateEls.gridCellSize.value,
                grid_enabled: stateEls.gridEnabled.checked ? 1 : 0
            });
        });

        document.getElementById('dc-show-form').addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('dc-input');
            await postForm('/api/show_dc.php', { dc_value: input.value });
            input.value = '';
        });
        document.getElementById('btn-hide-dc').onclick = () => postForm('/api/hide_dc.php', {});

        document.getElementById('entity-form').addEventListener('submit', async e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await postForm('/api/save_entity.php', fd, true);
            e.currentTarget.reset();
        });

        document.getElementById('entity-list').addEventListener('click', async e => {
            if (e.target.classList.contains('del-entity')) {
                await postForm('/api/delete_entity.php', { id: Number(e.target.dataset.id) });
            }
        });

        document.getElementById('add-icon-form').addEventListener('submit', async e => {
            e.preventDefault();
            await postForm('/api/add_icon.php', {
                entity_id: document.getElementById('add-icon-entity').value,
                grid_x: 0,
                grid_y: 0,
                size_cells: 1
            });
        });

        const notes = document.getElementById('notes');
        notes.value = localStorage.getItem('master_notes') || '';
        notes.addEventListener('input', () => localStorage.setItem('master_notes', notes.value));
    }

    bindForms();
    DndCommon.startPolling(render, 700);
})();
