/**
 * WebGL 2.0 GPU Çizim Motoru
 */

export class WebGLEngine {
    constructor(canvas, vsSource, fsSource) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', { alpha: false, antialias: true, depth: false });
        if (!this.gl) throw new Error('WebGL 2.0 desteklenmiyor!');

        this.gl.getExtension('EXT_color_buffer_float');

        this.program = this.createProgram(vsSource, fsSource);
        this.initBuffers();
        this.initUniforms();
        this.textures = {};
    }

    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source.trim());
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(shader);
            console.error('Shader Derleme Hatası:', err);
            throw new Error('Shader Hatası: ' + err);
        }
        return shader;
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const err = gl.getProgramInfoLog(program);
            console.error('Program Linkleme Hatası:', err);
            throw new Error('Program Link Hatası: ' + err);
        }
        return program;
    }

    initBuffers() {
        const gl = this.gl;
        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const aPos = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    }

    initUniforms() {
        const gl = this.gl;
        const prog = this.program;
        this.uniforms = {
            uRes: gl.getUniformLocation(prog, 'u_resolution'),
            uViewRange: gl.getUniformLocation(prog, 'u_view_range'),
            uPriceRange: gl.getUniformLocation(prog, 'u_price_range'),
            uMouse: gl.getUniformLocation(prog, 'u_mouse'),
            uTime: gl.getUniformLocation(prog, 'u_time'),
            uShowBg: gl.getUniformLocation(prog, 'u_show_bg'),
            uShowCloud: gl.getUniformLocation(prog, 'u_show_cloud'),
            uShowEma: gl.getUniformLocation(prog, 'u_show_ema'),
            uShowSignals: gl.getUniformLocation(prog, 'u_show_signals'),
            uShowCross: gl.getUniformLocation(prog, 'u_show_cross'),
            uCandleTex: gl.getUniformLocation(prog, 'u_candle_tex'),
            uCloudTex: gl.getUniformLocation(prog, 'u_cloud_tex'),
            uSignalsTex: gl.getUniformLocation(prog, 'u_signals_tex'),
            uCrossTex: gl.getUniformLocation(prog, 'u_cross_tex'),
            uTotalCandles: gl.getUniformLocation(prog, 'u_total_candles')
        };
    }

    updateTexture(name, unit, floatArray, width) {
        const gl = this.gl;
        if (!this.textures[name]) {
            this.textures[name] = gl.createTexture();
        }
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[name]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, 1, 0, gl.RGBA, gl.FLOAT, floatArray);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    render(state) {
        const gl = this.gl;
        const u = this.uniforms;

        gl.useProgram(this.program);
        gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
        gl.uniform2f(u.uViewRange, state.viewStart, state.viewEnd);
        gl.uniform2f(u.uPriceRange, state.minPrice, state.maxPrice);
        gl.uniform2f(u.uMouse, state.mousePixelX, state.mousePixelY);
        gl.uniform1f(u.uTime, state.time);

        gl.uniform1i(u.uShowBg, state.layers.bg ? 1 : 0);
        gl.uniform1i(u.uShowCloud, state.layers.cloud ? 1 : 0);
        gl.uniform1i(u.uShowEma, state.layers.ema ? 1 : 0);
        gl.uniform1i(u.uShowSignals, state.layers.signals ? 1 : 0);
        gl.uniform1i(u.uShowCross, state.layers.cross ? 1 : 0);

        if (this.textures['candle']) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textures['candle']);
            gl.uniform1i(u.uCandleTex, 0);
        }
        if (this.textures['cloud']) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.textures['cloud']);
            gl.uniform1i(u.uCloudTex, 1);
        }
        if (this.textures['signals']) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.textures['signals']);
            gl.uniform1i(u.uSignalsTex, 2);
        }
        if (this.textures['cross']) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this.textures['cross']);
            gl.uniform1i(u.uCrossTex, 3);
        }

        gl.uniform1f(u.uTotalCandles, state.totalCandles);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
