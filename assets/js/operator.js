(function () {
    const statusEl = document.getElementById('operator-status');
    const errorEl = document.getElementById('operator-error');
    const quickGrid = document.getElementById('quick-dc-grid');
    const manualForm = document.getElementById('operator-dc-form');
    const inputEl = document.getElementById('operator-dc-input');
    const showBtn = document.getElementById('operator-show-btn');
    const hideBtn = document.getElementById('operator-hide-btn');

    let requestInFlight = false;
    let quickButtons = [];

    function setBusy(isBusy) {
        requestInFlight = isBusy;
        showBtn.disabled = isBusy;
        hideBtn.disabled = isBusy;
        inputEl.disabled = isBusy;
        quickButtons.forEach(button => {
            button.disabled = isBusy;
            button.classList.toggle('is-sending', isBusy);
        });
    }

    function clearError() {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function renderStatus(state) {
        const dcVisible = Boolean(state?.dc_visible);
        const dcValue = Number(state?.dc_value);

        if (dcVisible && Number.isFinite(dcValue)) {
            statusEl.textContent = `Показана СЛ: ${dcValue}`;
        } else {
            statusEl.textContent = 'СЛ скрыта';
        }

        quickButtons.forEach(button => {
            const value = Number(button.dataset.dcValue);
            const isActive = dcVisible && Number.isFinite(dcValue) && value === dcValue;
            button.classList.toggle('is-active', isActive);
        });
    }

    async function showDc(dcValue, sourceButton = null) {
        if (requestInFlight) {
            return;
        }

        clearError();
        setBusy(true);
        if (sourceButton) {
            sourceButton.classList.add('is-sending');
        }

        try {
            const form = new FormData();
            form.append('dc_value', String(dcValue));
            const payload = await DndCommon.apiPost('/api/show_dc.php', form);
            if (!payload?.ok) {
                throw new Error(payload?.error || 'api_error');
            }
            const nextState = await DndCommon.fetchState();
            renderStatus(nextState);
        } catch (error) {
            showError(error?.message ? `Ошибка отправки: ${error.message}` : 'Ошибка отправки');
        } finally {
            if (sourceButton) {
                sourceButton.classList.remove('is-sending');
            }
            setBusy(false);
        }
    }

    async function hideDc() {
        if (requestInFlight) {
            return;
        }

        clearError();
        setBusy(true);

        try {
            const payload = await DndCommon.apiPost('/api/hide_dc.php', new FormData());
            if (!payload?.ok) {
                throw new Error(payload?.error || 'api_error');
            }
            const nextState = await DndCommon.fetchState();
            renderStatus(nextState);
        } catch (error) {
            showError(error?.message ? `Ошибка отправки: ${error.message}` : 'Ошибка отправки');
        } finally {
            setBusy(false);
        }
    }

    function clampDc(value) {
        if (!Number.isInteger(value)) {
            return null;
        }
        if (value < 1 || value > 99) {
            return null;
        }
        return value;
    }

    function buildQuickButtons() {
        const fragment = document.createDocumentFragment();

        for (let dc = 1; dc <= 20; dc += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quick-dc-btn';
            button.dataset.dcValue = String(dc);
            button.textContent = String(dc);
            button.addEventListener('click', () => {
                showDc(dc, button);
            });
            quickButtons.push(button);
            fragment.appendChild(button);
        }

        quickGrid.replaceChildren(fragment);
    }

    function bindEvents() {
        manualForm.addEventListener('submit', async event => {
            event.preventDefault();
            const parsed = clampDc(Number(inputEl.value));
            if (parsed === null) {
                showError('Введите число от 1 до 99');
                return;
            }
            await showDc(parsed);
        });

        hideBtn.addEventListener('click', hideDc);

        inputEl.addEventListener('input', () => {
            clearError();
        });
    }

    function initPolling() {
        DndCommon.startPolling(renderStatus, 800);
    }

    async function init() {
        buildQuickButtons();
        bindEvents();

        try {
            const state = await DndCommon.fetchState();
            renderStatus(state);
        } catch (error) {
            showError('Ошибка загрузки статуса');
        }

        initPolling();
    }

    init();
})();
