import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Update renderFxModalList to always sync active-ind-count
content = content.replace(
    `        function renderFxModalList(tab, query = '') {
            const container = document.getElementById('fx-modal-body');
            if (!container) return;
            let html = '';`,
    `        function renderFxModalList(tab, query = '') {
            const container = document.getElementById('fx-modal-body');
            if (!container) return;
            const countEl = document.getElementById('active-ind-count');
            if (countEl) countEl.innerText = activeIndicators.length;
            let html = '';`
);

// 2. Add IDs to close buttons
content = content.replace(
    '<button class="fx-modal-close" onclick="closeIndicatorModal()">✕</button>',
    '<button class="fx-modal-close" id="btn-close-fx-modal" onclick="closeIndicatorModal()">✕</button>'
);
content = content.replace(
    '<button class="fx-modal-close" onclick="closeIndicatorSettings()">✕</button>',
    '<button class="fx-modal-close" id="btn-close-settings-modal" onclick="closeIndicatorSettings()">✕</button>'
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Updated modal refinements!');
