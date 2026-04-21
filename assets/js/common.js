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

    function renderGrid(layer, cellSize) {
        layer.style.backgroundSize = `${cellSize}px ${cellSize}px`;
    }

    function renderIcons(layer, icons, cellSize, interactive = false, onPointerUp = null) {
        layer.innerHTML = '';
        icons.filter(i => i.is_visible).forEach(icon => {
            const div = document.createElement('div');
            div.className = 'icon';
            div.dataset.id = icon.id;
            div.style.left = `${icon.grid_x * cellSize}px`;
            div.style.top = `${icon.grid_y * cellSize}px`;
            div.style.width = `${cellSize * icon.size_cells}px`;
            div.style.height = `${cellSize * icon.size_cells}px`;
            if (icon.image_path) {
                const img = document.createElement('img');
                img.src = icon.image_path;
                img.alt = icon.name || '';
                div.appendChild(img);
            } else {
                div.textContent = (icon.name || '?').slice(0, 1).toUpperCase();
            }

            if (interactive && onPointerUp) {
                div.style.pointerEvents = 'auto';
                div.style.cursor = 'grab';
                div.draggable = true;
                div.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', String(icon.id)));
            }

            layer.appendChild(div);
        });

        if (interactive && onPointerUp) {
            layer.ondragover = e => e.preventDefault();
            layer.ondrop = onPointerUp;
        }
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

    window.DndCommon = { escapeHtml, apiGet, apiPost, fetchState, renderGrid, renderIcons, startPolling };
})();
