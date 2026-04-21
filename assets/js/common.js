(function () {
    function escapeHtml(text) {
        return String(text ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    async function apiGet(url) {
        const response = await fetch(url, { cache: 'no-store' });
        return response.json();
    }

    async function apiPost(url, formData) {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }

    async function fetchState() {
        const payload = await apiGet('/api/state.php');
        if (!payload.ok) {
            throw new Error(payload.error || 'state_error');
        }
        return payload.data;
    }

    function renderGrid(layer, cellSize, enabled = true) {
        layer.style.display = enabled ? 'block' : 'none';
        if (!enabled) {
            return;
        }
        layer.style.backgroundSize = `${cellSize}px ${cellSize}px`;
    }

    function renderIcons(layer, icons, cellSize, options = {}) {
        const {
            interactive = false,
            onDrop = null,
            onIconClick = null,
            selectedIconId = null,
            showSelection = false,
            debug = false,
            debugFormatter = null,
        } = options;

        layer.innerHTML = '';
        const total = Array.isArray(icons) ? icons.length : 0;
        const visibleIcons = (icons || []).filter(icon => Number(icon.is_visible) === 1);
        let rendered = 0;

        visibleIcons.forEach(icon => {
            const div = document.createElement('div');
            div.className = 'icon';
            div.dataset.id = icon.id;
            const gridX = Number.isFinite(Number(icon.grid_x)) ? Number(icon.grid_x) : 0;
            const gridY = Number.isFinite(Number(icon.grid_y)) ? Number(icon.grid_y) : 0;
            const sizeCells = Math.max(1, Number(icon.size_cells) || 1);
            div.style.left = `${gridX * cellSize}px`;
            div.style.top = `${gridY * cellSize}px`;
            div.style.width = `${cellSize * sizeCells}px`;
            div.style.height = `${cellSize * sizeCells}px`;

            if (showSelection && selectedIconId !== null && Number(icon.id) === Number(selectedIconId)) {
                div.classList.add('selected');
            }

            const fallbackText = (icon.name || '?').slice(0, 1).toUpperCase() || '?';
            if (icon.image_path) {
                const img = document.createElement('img');
                img.src = icon.image_path;
                img.alt = icon.name || '';
                img.onerror = () => {
                    img.remove();
                    div.classList.add('icon-fallback');
                    div.textContent = fallbackText;
                };
                div.appendChild(img);
            } else {
                div.classList.add('icon-fallback');
                div.textContent = fallbackText;
            }

            if (debug) {
                const label = document.createElement('span');
                label.className = 'icon-debug-label';
                label.textContent = typeof debugFormatter === 'function'
                    ? debugFormatter(icon)
                    : `#${icon.id} (${gridX},${gridY}) s${sizeCells}`;
                div.appendChild(label);
            }

            if (interactive) {
                div.style.pointerEvents = 'auto';
                div.style.cursor = 'grab';
                div.draggable = true;
                div.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', String(icon.id)));
            }

            if (typeof onIconClick === 'function') {
                div.addEventListener('click', () => onIconClick(icon));
            }

            layer.appendChild(div);
            rendered += 1;
        });

        if (interactive && typeof onDrop === 'function') {
            layer.ondragover = e => e.preventDefault();
            layer.ondrop = onDrop;
        }

        return { total, visible: visibleIcons.length, rendered };
    }


    function renderScene(config) {
        const {
            stage,
            sceneLayer,
            mapImage,
            gridLayer,
            iconsLayer,
            mapPath,
            gridCellSize,
            gridEnabled,
            icons,
            iconOptions = {},
            onSceneMetrics = null,
            onImageLoad = null,
        } = config;

        if (!stage || !sceneLayer || !mapImage || !gridLayer || !iconsLayer) {
            return null;
        }

        if (mapPath) {
            if (mapImage.getAttribute('src') !== mapPath) {
                mapImage.src = mapPath;
                mapImage.onload = () => {
                    if (typeof onImageLoad === 'function') {
                        onImageLoad();
                    }
                };
            }
        } else {
            mapImage.removeAttribute('src');
            sceneLayer.style.width = '0px';
            sceneLayer.style.height = '0px';
            renderGrid(gridLayer, gridCellSize, false);
            iconsLayer.innerHTML = '';
            return null;
        }

        const mapWidth = Math.max(1, mapImage.naturalWidth || stage.clientWidth || 1);
        const mapHeight = Math.max(1, mapImage.naturalHeight || stage.clientHeight || 1);
        sceneLayer.style.width = `${mapWidth}px`;
        sceneLayer.style.height = `${mapHeight}px`;

        const stageWidth = Math.max(1, stage.clientWidth || mapWidth);
        const stageHeight = Math.max(1, stage.clientHeight || mapHeight);
        const scale = Math.min(stageWidth / mapWidth, stageHeight / mapHeight);
        const offsetX = Math.floor((stageWidth - mapWidth * scale) / 2);
        const offsetY = Math.floor((stageHeight - mapHeight * scale) / 2);
        sceneLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

        renderGrid(gridLayer, gridCellSize, Boolean(gridEnabled));
        const iconStats = renderIcons(iconsLayer, icons, gridCellSize, iconOptions);

        const metrics = {
            mapWidth,
            mapHeight,
            stageWidth,
            stageHeight,
            scale,
            offsetX,
            offsetY,
            iconStats,
        };

        if (typeof onSceneMetrics === 'function') {
            onSceneMetrics(metrics);
        }

        return metrics;
    }

    function startPolling(callback, interval = 700) {
        let timer = null;
        const run = async () => {
            try {
                const state = await fetchState();
                callback(state);
                const nextInterval = state.poll_interval_ms || interval;
                timer = setTimeout(run, nextInterval);
            } catch (e) {
                timer = setTimeout(run, interval);
            }
        };

        run();
        return () => clearTimeout(timer);
    }

    window.DndCommon = { escapeHtml, apiGet, apiPost, fetchState, renderGrid, renderIcons, renderScene, startPolling };
})();
