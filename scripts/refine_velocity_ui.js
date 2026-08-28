import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Refine velocity script and expose window.velocityThreshold
const oldJsVel = `        // 🚀 İVME EŞİK VE KALİBRASYON YÖNETİMİ
        let velocityThreshold = parseFloat(localStorage.getItem('tradechart_velocity_threshold')) || 0.80;

        window.toggleVelocitySettings = function(e) {
            if (e) e.stopPropagation();
            const pop = document.getElementById('velocity-popover');
            if (pop) pop.classList.toggle('open');
        };

        window.updateVelocityThreshold = function(val) {
            velocityThreshold = parseFloat(val);
            localStorage.setItem('tradechart_velocity_threshold', velocityThreshold);
            document.getElementById('current-threshold-label').innerText = velocityThreshold.toFixed(2);
            document.getElementById('slider-val').innerText = \`\${velocityThreshold.toFixed(2)} px/ms\`;
            document.getElementById('velocity-threshold-slider').value = velocityThreshold;
        };`;

const newJsVel = `        // 🚀 İVME EŞİK VE KALİBRASYON YÖNETİMİ
        let velocityThreshold = parseFloat(localStorage.getItem('tradechart_velocity_threshold')) || 0.80;
        window.velocityThreshold = velocityThreshold;

        window.toggleVelocitySettings = function(e) {
            if (e) e.stopPropagation();
            const pop = document.getElementById('velocity-popover');
            if (pop) pop.classList.toggle('open');
        };

        window.updateVelocityThreshold = function(val) {
            velocityThreshold = parseFloat(val);
            window.velocityThreshold = velocityThreshold;
            localStorage.setItem('tradechart_velocity_threshold', velocityThreshold);
            const lbl = document.getElementById('current-threshold-label');
            const slbl = document.getElementById('slider-val');
            const slider = document.getElementById('velocity-threshold-slider');
            if (lbl) lbl.innerText = velocityThreshold.toFixed(2);
            if (slbl) slbl.innerText = \`\${velocityThreshold.toFixed(2)} px/ms\`;
            if (slider) slider.value = velocityThreshold;
        };`;

content = content.replace(oldJsVel, newJsVel);

// 2. Refine popover CSS
const oldPopoverCss = `        .velocity-settings-popover {
            display: none;
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 270px;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 8px;
            padding: 12px 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.75);
            z-index: 100;
            font-size: 11px;
            color: #94a3b8;
        }`;

const newPopoverCss = `        .velocity-settings-popover {
            display: none;
            position: absolute;
            bottom: calc(100% + 10px);
            left: 0;
            width: 280px;
            background: #1e222d;
            border: 1px solid #38bdf8;
            border-radius: 8px;
            padding: 12px 14px;
            box-shadow: 0 12px 35px rgba(0,0,0,0.9);
            z-index: 9999;
            font-size: 11px;
            color: #94a3b8;
        }`;

content = content.replace(oldPopoverCss, newPopoverCss);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Refined velocity popover CSS and exposed window.velocityThreshold!');
