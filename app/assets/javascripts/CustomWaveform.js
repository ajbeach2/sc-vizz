define('CustomWaveform', ["RenderItem", "Milk", "WaveFrameVariablePool",
    "WavePointVariablePool"
], function(RenderItem, Milk, WaveFrameVariablePool, WavePointVariablePool) {
    CustomWaveform.prototype = new RenderItem();
    CustomWaveform.constructor = CustomWaveform;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function CustomWaveform(literal, initialQs) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;

        this.spectrum = false;
        this.dots = false;
        this.thick = false;
        this.additive = false;
        this.samples = 512;
        this.scaling = 1;
        this.smoothing = 0;
        this.sep = 0;

        this.init_code = function() {};
        this.per_frame_code = function() {};
        this.per_point_code = function() {};

        this.masterAlpha = 1.0;
        for (var prop in literal)
            if (prop.toLowerCase() == "bspectrum")
                this.spectrum = new Boolean(literal[prop]);
            else
        if (prop.toLowerCase() == "bdrawthick")
            this.thick = new Boolean(literal[prop]);
        else if (prop.toLowerCase() == "busedots")
            this.dots = new Boolean(literal[prop]);
        else if (prop.toLowerCase() == "badditive")
            this.additive = new Boolean(literal[prop]);
        else
            this[prop] = literal[prop];

        if (this.samples > 512)
            this.samples = 512;

        this.initialVals = new WaveFrameVariablePool();
        this.initialVals.pushOutputs(this);

        this.framePool = new WaveFrameVariablePool();
        this.pointPool = new WavePointVariablePool();
        this.varInit();
        this.framePool.pushQs(initialQs);
        this.init_code(this.framePool);
        this.initialTs = new Float32Array(8);
        this.framePool.popTs(this.initialTs);

        this.waveDataL = new Float32Array(this.samples);
        this.waveDataR = new Float32Array(this.samples);

        this.r_mesh = new Float32Array(this.samples);
        this.g_mesh = new Float32Array(this.samples);
        this.b_mesh = new Float32Array(this.samples);
        this.a_mesh = new Float32Array(this.samples);
        this.x_mesh = new Float32Array(this.samples);
        this.y_mesh = new Float32Array(this.samples);

        this.colors = new Float32Array(this.samples * 4);
        this.p = new Float32Array(this.samples * 2);
        this.colorbuf = gl.createBuffer();
        this.pbuf = gl.createBuffer();
    }
    CustomWaveform.prototype = {
        varInit: function() {
            var testPool = new WaveFrameVariablePool();
            var winProps = {};
            for (var prop in window)
                winProps[prop] = null;
            for (var i = 0; i < 30; i++)
                try {
                    this.init_code(testPool);
                    this.per_frame_code(testPool);
                    break;
                } catch (error) {
                    if (error.name == "ReferenceError") {
                        var customVar = error.message.split(" ")[0];
                        this.framePool[customVar] = 0;
                        testPool[customVar] = 0;
                    } else {
                        console.log(this.init_code);
                        console.log(this.per_frame_code);
                        throw error;
                    }
                }
            for (var prop in window)
                if (!(prop in winProps)) {
                    this.framePool[prop] = 0;
                    delete window[prop];
                }
        },

        runCode: function() {
            this.framePool.pushTs(this.initialTs);
            this.initialVals.popOutputs(this.framePool);
            this.per_frame_code(this.framePool);
            this.framePool.popOutputs(this);
        },

        runPerPoint: function() {
            this.framePool.transferQs(this.pointPool);
            this.framePool.transferTs(this.pointPool);
            this.pointPool.pushInputs(this.framePool);
            for (var i = 0; i < this.samples; i++) {
                this.pointPool.sample = i / (this.samples - 1);
                this.pointPool.value1 = this.waveDataL[i];
                this.pointPool.value2 = this.waveDataR[i];
                this.pointPool.r = this.r;
                this.pointPool.g = this.g;
                this.pointPool.b = this.b;
                this.pointPool.a = this.a;
                this.pointPool.x = this.x;
                this.pointPool.y = this.y;
                this.per_point_code(this.pointPool);
                this.r_mesh[i] = this.pointPool.r;
                this.g_mesh[i] = this.pointPool.g;
                this.b_mesh[i] = this.pointPool.b;
                this.a_mesh[i] = this.pointPool.a;
                this.x_mesh[i] = this.pointPool.x;
                this.y_mesh[i] = this.pointPool.y;
            }
        },

        Draw: function(context) {

            gl.enable(gl.BLEND);
            if (this.additive) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            if (this.thick) {
                gl.lineWidth(context.texsize <= 512 ? 2 : 2 * context.texsize / 512);
                milk.uPointSize(context.texsize <= 512 ? 2 : 2 * context.texsize / 512);
            } else uPointSize(context.texsize <= 512 ? 1 : context.texsize / 512);

            context.music.getPCM(this.waveDataL, this.samples, 0, this.spectrum, this.smoothing);
            context.music.getPCM(this.waveDataR, this.samples, 1, this.spectrum, this.smoothing);

            var mult = this.scaling * (this.spectrum ? 0.015 : 1.0);
            for (var i = 0; i < this.samples; i++) {
                this.waveDataL[i] *= mult;
                this.waveDataR[i] *= mult;
            }

            this.runPerPoint();

            for (var i = 0; i < this.samples; i++) {
                this.colors[i * 4] = this.r_mesh[i];
                this.colors[i * 4 + 1] = this.g_mesh[i];
                this.colors[i * 4 + 2] = this.b_mesh[i];
                this.colors[i * 4 + 3] = this.a_mesh[i] * this.masterAlpha;
                this.p[i * 2] = this.x_mesh[i];
                this.p[i * 2 + 1] = -(this.y_mesh[i] - 1);
            }

            milk.uEnableClientState(U_VERTEX_ARRAY);
            milk.uEnableClientState(U_COLOR_ARRAY);
            milk.uDisableClientState(U_TEXTURE_COORD_ARRAY);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.pbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.p, gl.STATIC_DRAW);
            milk.uVertexPointer(2, gl.FLOAT, 0, this.pbuf);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
            milk.uColorPointer(4, gl.FLOAT, 0, this.colorbuf);

            if (this.dots) uDrawArrays(gl.POINTS, 0, this.samples);
            else uDrawArrays(gl.LINE_STRIP, 0, this.samples);

            milk.uPointSize(context.texsize < 512 ? 1 : context.texsize / 512);
            gl.lineWidth(context.texsize < 512 ? 1 : context.texsize / 512);

            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        }
    }
    return CustomWaveform;
});