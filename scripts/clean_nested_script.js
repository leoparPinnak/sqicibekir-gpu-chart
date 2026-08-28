import fs from 'fs';
import vm from 'vm';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace any nested <script> inside <script>
content = content.replace(/<script>\s*<script>/g, '<script>');
// Check for <script>\n\s*<script>
content = content.replace(/<script>[\s\n\r]*<script>/g, '<script>');

// Also check where script tag #2 is
const vsPos = content.indexOf('<script id="vs"');
const fsPos = content.indexOf('<script id="fs"');
const mainScriptPos = content.indexOf('<!-- ==================== JAVASCRIPT MOTORU ==================== -->');

console.log('Shader and Script positions:', { vsPos, fsPos, mainScriptPos });

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cleaned nested script tags.');
