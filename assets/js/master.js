(function () {
    const stateEls = {
        mapImage: document.getElementById('master-map-image'),
        mapStage: document.getElementById('master-map-stage'),
        gridLayer: document.getElementById('master-grid-layer'),
        iconsLayer: document.getElementById('master-icons-layer'),
        gridEnabled: document.getElementById('grid-enabled'),
        gridCellSize: document.getElementById('grid-cell-size'),
        mapList: document.getElementById('map-list'),
        entityList: document.getElementById('entity-list'),
        addIconEntity: document.getElementById('add-icon-entity'),
        addIconGridX: document.getElementById('add-icon-grid-x'),
        addIconGridY: document.getElementById('add-icon-grid-y'),
        addIconSizeCells: document.getElementById('add-icon-size-cells'),
        entityForm: document.getElementById('entity-form'),
        entityId: document.getElementById('entity-id'),
        entityName: document.getElementById('entity-name'),
        entitySide: document.getElementById('entity-side'),
        entityAc: document.getElementById('entity-ac'),
        entityHpCurrent: document.getElementById('entity-hp-current'),
        entityHpMax: document.getElementById('entity-hp-max'),
        entitySort: document.getElementById('entity-sort'),
        entityVisible: document.getElementById('entity-visible'),
        entitySubmit: document.getElementById('entity-submit'),
        entityCancel: document.getElementById('entity-cancel'),
        selectedIconPanel: document.getElementById('selected-icon-panel'),
        selectedIconMeta: document.getElementById('selected-icon-meta'),
        selectedIconForm: document.getElementById('selected-icon-form'),
        selectedIconGridX: document.getElementById('selected-icon-grid-x'),
        selectedIconGridY: document.getElementById('selected-icon-grid-y'),
        selectedIconSizeCells: document.getElementById('selected-icon-size-cells'),
        selectedIconDelete: document.getElementById('selected-icon-delete'),
    };

    let latestState = null;
    let editingEntityId = null;
    let selectedIconId = null;
    let gridFormDirty = false;
    let pauseUpdatesUntil = 0;


    function pauseUpdates(ms = 1800) {
        pauseUpdatesUntil = Math.max(pauseUpdatesUntil, Date.now() + ms);
    }

    function isUpdatesPaused() {
        return Date.now() < pauseUpdatesUntil || document.querySelector('.item-menu.open') !== null;
    }

    function closeAllActionMenus() {
        document.querySelectorAll('.item-menu.open').forEach(menu => menu.classList.remove('open'));
    }

    function toggleActionMenu(button) {
        const container = button.closest('.item-menu');
        if (!container) {
            return;
        }

        const isOpen = container.classList.contains('open');
        pauseUpdates(3500);
        closeAllActionMenus();
        if (!isOpen) {
            container.classList.add('open');
        }
    }

    async function postForm(url, entries, isMultipart = false) {
        const form = isMultipart ? entries : new FormData();
        if (!isMultipart) {
            Object.entries(entries).forEach(([k, v]) => form.append(k, v));
        }
        const payload = await DndCommon.apiPost(url, form);
        if (!payload.ok) throw new Error(payload.error || 'api_error');
        return payload.data;
    }

    function setEntityEditing(entity = null) {
        editingEntityId = entity ? Number(entity.id) : null;
        if (!entity) {
            stateEls.entityId.value = '';
            stateEls.entityForm.reset();
            stateEls.entityVisible.checked = true;
            stateEls.entitySort.value = 0;
            stateEls.entitySubmit.textContent = 'Сохранить сущность';
            stateEls.entityCancel.classList.add('hidden');
            return;
        }

        stateEls.entityId.value = entity.id;
        stateEls.entityName.value = entity.name || '';
        stateEls.entitySide.value = entity.side;
        stateEls.entityAc.value = entity.armor_class ?? '';
        stateEls.entityHpCurrent.value = entity.hp_current ?? '';
        stateEls.entityHpMax.value = entity.hp_max ?? '';
        stateEls.entitySort.value = entity.sort_order ?? 0;
        stateEls.entityVisible.checked = Boolean(entity.is_visible);
        stateEls.entitySubmit.textContent = 'Сохранить изменения';
        stateEls.entityCancel.classList.remove('hidden');
    }

    function setSelectedIcon(icon = null) {
        selectedIconId = icon ? Number(icon.id) : null;
        if (!icon) {
            stateEls.selectedIconPanel.classList.add('hidden');
            return;
        }

        stateEls.selectedIconPanel.classList.remove('hidden');
        stateEls.selectedIconMeta.textContent = `#${icon.id} — ${icon.name || 'Без имени'} (${icon.grid_x}, ${icon.grid_y})`;
        stateEls.selectedIconGridX.value = icon.grid_x;
        stateEls.selectedIconGridY.value = icon.grid_y;
        stateEls.selectedIconSizeCells.value = icon.size_cells;
    }

    function fillMapList() {
        DndCommon.apiGet('/api/list_maps.php').then(payload => {
            const maps = payload.ok ? payload.data.maps : [];
            stateEls.mapList.innerHTML = maps.map(m => `<div class="list-item map-list-item">
                <span class="item-title">${DndCommon.escapeHtml(m.title)}</span>
                <div class="item-controls">
                    ${m.is_active
            ? '<span class="status-badge">Активна</span>'
            : `<button data-id="${m.id}" class="activate-map" type="button">Активировать</button>`}
                    <div class="item-menu" data-type="map" data-id="${m.id}">
                        <button type="button" class="menu-toggle" aria-label="Действия карты">...</button>
                        <div class="dropdown-menu">
                            <button data-id="${m.id}" data-title="${DndCommon.escapeHtml(m.title)}" class="rename-map" type="button">Переименовать</button>
                            <button data-id="${m.id}" class="delete-map danger" type="button">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>`).join('');
        });
    }

    function fillEntityList(state) {
        const entities = state.entities;
        stateEls.entityList.innerHTML = entities.map(e => `<div class="list-item entity-list-item">
            <span class="item-title">${DndCommon.escapeHtml(e.name)} (${e.side}) • КД ${e.armor_class ?? '-'} • ХП ${e.hp_current ?? '-'}${e.hp_max !== null ? `/${e.hp_max}` : ''}</span>
            <div class="item-controls">
                <div class="item-menu" data-type="entity" data-id="${e.id}">
                    <button type="button" class="menu-toggle" aria-label="Действия сущности">...</button>
                    <div class="dropdown-menu">
                        <button class="edit-entity" data-id="${e.id}" type="button">Редактировать</button>
                        <button class="danger del-entity" data-id="${e.id}" type="button">Удалить</button>
                    </div>
                </div>
            </div>
        </div>`).join('');

        const previousValue = stateEls.addIconEntity.value;
        stateEls.addIconEntity.innerHTML = entities.map(e => `<option value="${e.id}">${DndCommon.escapeHtml(e.name)}</option>`).join('');
        if (previousValue && entities.some(e => String(e.id) === previousValue)) {
            stateEls.addIconEntity.value = previousValue;
        }
    }

    function render(state) {
        latestState = state;

        if (isUpdatesPaused()) {
            return;
        }

        fillMapList();
        fillEntityList(state);

        if (state.active_map) {
            stateEls.mapImage.src = state.active_map.file_path;
        } else {
            stateEls.mapImage.removeAttribute('src');
        }

        if (!gridFormDirty) {
            stateEls.gridEnabled.checked = Boolean(state.grid_enabled);
            stateEls.gridCellSize.value = state.grid_cell_size;
        }
        DndCommon.renderGrid(stateEls.gridLayer, state.grid_cell_size, Boolean(state.grid_enabled));

        const selected = state.icons.find(i => Number(i.id) === Number(selectedIconId)) || null;
        if (!selected && selectedIconId !== null) {
            setSelectedIcon(null);
        } else if (selected) {
            setSelectedIcon(selected);
        }

        DndCommon.renderIcons(stateEls.iconsLayer, state.icons, state.grid_cell_size, {
            interactive: true,
            selectedIconId,
            showSelection: true,
            onIconClick: icon => setSelectedIcon(icon),
            onDrop: async e => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData('text/plain'));
                const rect = stateEls.iconsLayer.getBoundingClientRect();
                const x = Math.max(0, Math.round((e.clientX - rect.left) / state.grid_cell_size));
                const y = Math.max(0, Math.round((e.clientY - rect.top) / state.grid_cell_size));
                await postForm('/api/move_icon.php', { id, grid_x: x, grid_y: y });
                selectedIconId = id;
                render(await DndCommon.fetchState());
            }
        });
    }

    function changeInputValue(inputId, delta, min = null, max = null) {
        const input = document.getElementById(inputId);
        if (!input) {
            return;
        }
        const current = Number(input.value || 0);
        let next = current + delta;
        if (min !== null) {
            next = Math.max(min, next);
        }
        if (max !== null) {
            next = Math.min(max, next);
        }
        input.value = String(next);
    }

    async function moveSelectedIcon(dx, dy) {
        if (!selectedIconId || !latestState) {
            return;
        }

        const icon = latestState.icons.find(i => Number(i.id) === Number(selectedIconId));
        if (!icon) {
            return;
        }

        await postForm('/api/move_icon.php', {
            id: selectedIconId,
            grid_x: Math.max(0, Number(icon.grid_x) + dx),
            grid_y: Math.max(0, Number(icon.grid_y) + dy),
        });
    }

    async function resizeSelectedIcon(delta) {
        if (!selectedIconId || !latestState) {
            return;
        }

        const icon = latestState.icons.find(i => Number(i.id) === Number(selectedIconId));
        if (!icon) {
            return;
        }

        const nextSize = Math.min(4, Math.max(1, Number(icon.size_cells) + delta));
        await postForm('/api/update_icon.php', {
            id: selectedIconId,
            grid_x: icon.grid_x,
            grid_y: icon.grid_y,
            size_cells: nextSize,
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

        stateEls.mapList.addEventListener('click', async e => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            pauseUpdates();

            if (target.classList.contains('menu-toggle')) {
                toggleActionMenu(target);
                return;
            }

            if (target.classList.contains('activate-map')) {
                await postForm('/api/update_state.php', { active_map_id: Number(target.dataset.id) });
            }
            if (target.classList.contains('rename-map')) {
                const id = Number(target.dataset.id);
                const currentTitle = target.dataset.title || '';
                const title = prompt('Введите новое название карты', currentTitle);
                if (title !== null && title.trim()) {
                    await postForm('/api/update_map.php', { id, title: title.trim() });
                }
                closeAllActionMenus();
            }
            if (target.classList.contains('delete-map')) {
                const id = Number(target.dataset.id);
                if (confirm('Удалить карту?')) {
                    await postForm('/api/delete_map.php', { id });
                }
                closeAllActionMenus();
            }
        });

        document.getElementById('grid-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            await postForm('/api/update_state.php', {
                grid_cell_size: stateEls.gridCellSize.value,
                grid_enabled: stateEls.gridEnabled.checked ? 1 : 0
            });
            gridFormDirty = false;
            render(await DndCommon.fetchState());
        });

        stateEls.gridEnabled.addEventListener('change', () => {
            gridFormDirty = true;
        });
        stateEls.gridCellSize.addEventListener('input', () => {
            gridFormDirty = true;
        });

        document.getElementById('dc-show-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            const input = document.getElementById('dc-input');
            await postForm('/api/show_dc.php', { dc_value: input.value });
            input.value = '';
        });
        document.getElementById('btn-hide-dc').onclick = () => postForm('/api/hide_dc.php', {});

        stateEls.entityForm.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (!editingEntityId) {
                fd.delete('id');
            }
            await postForm('/api/save_entity.php', fd, true);
            setEntityEditing(null);
        });

        stateEls.entityCancel.addEventListener('click', () => setEntityEditing(null));

        stateEls.entityList.addEventListener('click', async e => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            pauseUpdates();

            if (target.classList.contains('menu-toggle')) {
                toggleActionMenu(target);
                return;
            }

            pauseUpdates();

            if (target.classList.contains('del-entity')) {
                if (confirm('Удалить сущность?')) {
                    await postForm('/api/delete_entity.php', { id: Number(target.dataset.id) });
                }
                closeAllActionMenus();
            }
            if (target.classList.contains('edit-entity')) {
                const id = Number(target.dataset.id);
                const entity = latestState?.entities.find(row => Number(row.id) === id);
                if (entity) {
                    setEntityEditing(entity);
                }
                closeAllActionMenus();
            }
        });

        document.getElementById('add-icon-form').addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            await postForm('/api/add_icon.php', {
                entity_id: stateEls.addIconEntity.value,
                grid_x: stateEls.addIconGridX.value,
                grid_y: stateEls.addIconGridY.value,
                size_cells: stateEls.addIconSizeCells.value
            });
        });

        stateEls.selectedIconForm.addEventListener('submit', async e => {
            pauseUpdates(2200);
            e.preventDefault();
            if (!selectedIconId) {
                return;
            }
            await postForm('/api/update_icon.php', {
                id: selectedIconId,
                grid_x: stateEls.selectedIconGridX.value,
                grid_y: stateEls.selectedIconGridY.value,
                size_cells: stateEls.selectedIconSizeCells.value,
            });
        });

        stateEls.selectedIconDelete.addEventListener('click', async () => {
            pauseUpdates(2200);
            if (!selectedIconId) {
                return;
            }
            if (confirm('Удалить иконку?')) {
                await postForm('/api/delete_icon.php', { id: selectedIconId });
                setSelectedIcon(null);
            }
        });

        document.querySelectorAll('.icon-step').forEach(btn => {
            btn.addEventListener('click', async () => {
                pauseUpdates(2200);
                const dir = btn.dataset.dir;
                const shifts = {
                    left: [-1, 0],
                    right: [1, 0],
                    up: [0, -1],
                    down: [0, 1],
                };
                const [dx, dy] = shifts[dir] || [0, 0];
                await moveSelectedIcon(dx, dy);
            });
        });

        document.querySelectorAll('.icon-size-step').forEach(btn => {
            btn.addEventListener('click', async () => {
                pauseUpdates(2200);
                await resizeSelectedIcon(Number(btn.dataset.delta || 0));
            });
        });

        stateEls.entityForm.querySelectorAll('.quick-adjust').forEach(button => {
            button.addEventListener('click', () => {
                pauseUpdates(3000);
                const targetId = button.dataset.target;
                const delta = Number(button.dataset.delta || 0);
                changeInputValue(targetId, delta, 0);
            });
        });

        stateEls.mapStage.addEventListener('click', e => {
            pauseUpdates(1200);
            if (e.target === stateEls.iconsLayer || e.target === stateEls.gridLayer || e.target === stateEls.mapImage || e.target === stateEls.mapStage) {
                setSelectedIcon(null);
            }
        });

        document.addEventListener('click', e => {
            if (!(e.target instanceof Element) || !e.target.closest('.item-menu')) {
                closeAllActionMenus();
            }
        });


        document.querySelector('.master-controls')?.addEventListener('pointerdown', () => {
            pauseUpdates(2500);
        });

        const notes = document.getElementById('notes');
        notes.value = localStorage.getItem('master_notes') || '';
        notes.addEventListener('input', () => localStorage.setItem('master_notes', notes.value));
    }

    bindForms();
    DndCommon.startPolling(render, 700);
})();
