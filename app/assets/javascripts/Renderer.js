define("Renderer", ["PerPixelMesh", "RenderTarget"], function(PerPixelMesh, RenderTarget) {

    function Renderer(width, height, gx, gy, texsize, music) {
        this.presetName = "None";
        this.vw = width;
        this.vh = height;
        this.texsize = texsize;
        this.mesh = new PerPixelMesh(gx, gy);
        this.totalframes = 1;
        this.noSwitch = false;
        this.realfps = 0;
        this.correction = true;
        this.aspect = height / width;
        this.renderTarget = new RenderTarget(texsize, width, height);
        this.music = music;
        this.renderContext = {};

        this.p = new Float32Array(this.mesh.width * 2 * 2);
        this.pbuf = gl.createBuffer();

        this.t = new Float32Array(this.mesh.width * 2 * 2);
        this.tbuf = gl.createBuffer();

        this.cot = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1])
        this.cotbuf = gl.createBuffer();

        this.cop = new Float32Array([-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5])
        this.copbuf = gl.createBuffer();
    }

    Renderer.currentPipe = null;
    Renderer.SetPipeline = function(pipeline) {
        Renderer.currentPipe = pipeline;
    }
    Renderer.PerPixel = function(p, context) {
        return p;
        //return Renderer.currentPipe.PerPixel(p,context);
    }

    Renderer.prototype = {
        ResetTextures: function() {
            delete this.renderTarget;
            this.reset(this.vw, this.vh);
        },

        SetupPass1: function() {
            this.totalframes++;
            this.renderTarget.lock();
            gl.viewport(0, 0, this.renderTarget.texsize, this.renderTarget.texsize);

            uEnableClientState(U_TEXTURE_COORD_ARRAY);

            uMatrixMode(U_TEXTURE);
            uLoadIdentity();
            uMatrixMode(U_PROJECTION);
            uLoadIdentity();
            uOrthof(0.0, 1, 0.0, 1, -40, 40);
            uMatrixMode(U_MODELVIEW);
            uLoadIdentity();
        },

        RenderItems: function(pipeline, pipelineContext) {
            this.renderContext.time = pipelineContext.time;
            this.renderContext.texsize = this.texsize;
            this.renderContext.aspectCorrect = this.correction;
            this.renderContext.aspectRatio = this.aspect;
            this.renderContext.music = this.music;

            for (var pos = 0; pos < pipeline.drawables.length; pos++)
                if (pipeline.drawables[pos] != null)
                    pipeline.drawables[pos].Draw(this.renderContext);
        },

        FinishPass1: function() {
            this.renderTarget.unlock();
        },

        Pass2: function(pipeline, pipelineContext) {
            gl.viewport(0, 0, this.vw, this.vh);
            gl.bindTexture(gl.TEXTURE_2D, this.renderTarget.textureID[0]);
            uMatrixMode(U_PROJECTION);
            uLoadIdentity();
            uOrthof(-0.5, 0.5, -0.5, 0.5, -40, 40);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.lineWidth(this.renderTarget.texsize < 512 ? 1 : this.renderTarget.texsize / 512.0);
            this.CompositeOutput(pipeline, pipelineContext);

            uMatrixMode(U_MODELVIEW);
            uLoadIdentity();
            uTranslatef(-0.5, -0.5, 0);
            uTranslatef(0.5, 0.5, 0);

        },

        RenderFrame: function(pipeline, pipelineContext) {
            this.SetupPass1(pipeline, pipelineContext);
            this.Interpolation(pipeline);
            this.RenderItems(pipeline, pipelineContext);
            this.FinishPass1();
            this.Pass2(pipeline, pipelineContext);
        },

        Interpolation: function(pipeline) {

            gl.bindTexture(gl.TEXTURE_2D, this.renderTarget.textureID[0]);
            if (pipeline.textureWrap == 0) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }

            uMatrixMode(U_TEXTURE);
            uLoadIdentity();
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ZERO);

            uColor4f(1.0, 1.0, 1.0, pipeline.screenDecay);

            uEnableClientState(U_VERTEX_ARRAY);
            uEnableClientState(U_TEXTURE_COORD_ARRAY);
            uDisableClientState(U_COLOR_ARRAY);

            uVertexPointer(2, gl.FLOAT, 0, this.pbuf);
            uTexCoordPointer(2, gl.FLOAT, 0, this.tbuf);

            function round(val, n) {
                return Math.round(val * Math.pow(10, n)) / Math.pow(10, n);
            }

            if (pipeline.staticPerPixel) {
                for (var j = 0; j < this.mesh.height - 1; j++) {
                    for (var i = 0; i < this.mesh.width; i++) {
                        this.t[i * 4] = pipeline.x_mesh[i][j];
                        this.t[i * 4 + 1] = pipeline.y_mesh[i][j];
                        this.t[i * 4 + 2] = pipeline.x_mesh[i][j + 1];
                        this.t[i * 4 + 3] = pipeline.y_mesh[i][j + 1];

                        var index = j * this.mesh.width + i;
                        var index2 = (j + 1) * this.mesh.width + i;

                        this.p[i * 4] = this.mesh.identity[index].x;
                        this.p[i * 4 + 1] = this.mesh.identity[index].y;
                        this.p[i * 4 + 2] = this.mesh.identity[index2].x;
                        this.p[i * 4 + 3] = this.mesh.identity[index2].y;
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, this.t, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.pbuf);
                    gl.bufferData(gl.ARRAY_BUFFER, this.p, gl.STATIC_DRAW);
                    uDrawArrays(gl.TRIANGLE_STRIP, 0, this.mesh.width * 2);
                }
            } else
                print("not static per pixel");

            uDisableClientState(U_TEXTURE_COORD_ARRAY);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        },

        reset: function(w, h) {
            this.aspect = h / w;
            this.vw = w;
            this.vh = h;
            gl.cullFace(gl.BACK);
            gl.clearColor(0, 0, 0, 0);
            gl.viewport(0, 0, w, h);
            uMatrixMode(U_TEXTURE);
            uLoadIdentity();
            uMatrixMode(U_PROJECTION);
            uLoadIdentity();
            uMatrixMode(U_MODELVIEW);
            uLoadIdentity();
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        },

        CompositeOutput: function(pipeline, pipelineContext) {
            uMatrixMode(U_TEXTURE);
            uLoadIdentity();
            uMatrixMode(U_MODELVIEW);
            uLoadIdentity();

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ZERO);
            uColor4f(1.0, 1.0, 1.0, 1.0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.cotbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.cot, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.copbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.cop, gl.STATIC_DRAW);

            uEnableClientState(U_VERTEX_ARRAY);
            uDisableClientState(U_COLOR_ARRAY);
            uEnableClientState(U_TEXTURE_COORD_ARRAY);

            uVertexPointer(2, gl.FLOAT, 0, this.copbuf);
            uTexCoordPointer(2, gl.FLOAT, 0, this.cotbuf);

            uDrawArrays(gl.TRIANGLE_FAN, 0, 4);
            uDisableClientState(U_TEXTURE_COORD_ARRAY);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            for (var pos = 0; pos < pipeline.compositeDrawables; pos++)
                pipeline.compositeDrawables[pos].Draw(this.renderContext);

        }
    }

    return Renderer;
});