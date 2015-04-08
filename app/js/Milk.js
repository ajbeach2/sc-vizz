define("Milk", function() {

    var instance = null;

    function Milk(canvasId) {

        if (instance != null) {
            throw new Error("Cannot instantiate more than one Milk, use Milk.getInstance()");
        }

        this.canvas = document.getElementById(canvasId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.gl = this.canvas.getContext("experimental-webgl", {
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
        });

        this.U_PROJECTION = 0;
        this.U_MODELVIEW = 1;
        this.U_TEXTURE = 2;

        this.U_VERTEX_ARRAY = 0;
        this.U_TEXTURE_COORD_ARRAY = 1;
        this.U_COLOR_ARRAY = 2;

        this.mvMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.prMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.mvpMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.txMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.activeMatrix = this.prMatrix;

        this.mvStack = [];
        this.prStack = [];
        this.txStack = [];
        this.activeStack = this.prStack;
        this.enablestex = false;
        this.enablevco = false;
        this.upointsize = 1.0;
        this.ucolr = 1.0;
        this.ucolg = 1.0;
        this.ucolb = 1.0;
        this.ucola = 1.0;

        this.vertexPos;
        this.colorPos;
        this.texCoordPos;

        this.ucolorloc;
        this.stextureloc;
        this.upointsizeloc;
        this.mvpmatrixloc;
        this.txmatrixloc;
        this.enablestexloc;
        this.enablevcoloc;

        this.textures = {};
        this.texture_list = ["title.png"];
        this.texloads = 0;
    }

    Milk.prototype = {


        resizeCanvas: function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        },

        initGL: function(callback) {

            var vertexShader = this.loadShader(this.gl.VERTEX_SHADER,
                "precision mediump float; \
            attribute vec4 a_position; \
            attribute vec4 a_texCoord; \
            varying vec4 v_texCoord; \
            attribute vec4 a_color; \
            uniform vec4 u_color; \
            varying vec4 v_color; \
            uniform bool enable_v_color; \
            uniform float u_pointsize; \
            uniform mat4 mvp_matrix; \
            uniform mat4 tx_matrix; \
            void main() { \
              gl_Position = mvp_matrix * a_position; \
              v_texCoord = tx_matrix * a_texCoord; \
              if (enable_v_color) \
                v_color = a_color; \
              else \
                v_color = u_color; \
              gl_PointSize = u_pointsize; \
            }");

            var fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER,
                "precision mediump float; \
                varying vec4 v_texCoord; \
                uniform sampler2D s_texture; \
            varying vec4 v_color; \
            uniform bool enable_s_texture; \
            void main() { \
              if (enable_s_texture) \
                gl_FragColor = v_color * texture2D(s_texture, v_texCoord.st); \
              else \
                gl_FragColor = v_color; \
            }");


            var shaderProgram = this.gl.createProgram();
            this.gl.attachShader(shaderProgram, vertexShader);
            this.gl.attachShader(shaderProgram, fragmentShader);



            var vertices = new Float32Array([0.0, 0.0, 0.0]),
                vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

            this.gl.bindAttribLocation(shaderProgram, 0, 'a_position');
            this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(0);

            this.gl.linkProgram(shaderProgram);


            if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS))
                throw Error("Unable to initialize the shader program.");
            this.gl.useProgram(shaderProgram);

            console.log(this.gl.getError());


            this.vertexPos = this.gl.getAttribLocation(shaderProgram, "a_position");

            this.colorPos = this.gl.getAttribLocation(shaderProgram, "a_color");
            this.texCoordPos = this.gl.getAttribLocation(shaderProgram, "a_texCoord");
            this.ucolorloc = this.gl.getUniformLocation(shaderProgram, "u_color");
            this.stextureloc = this.gl.getUniformLocation(shaderProgram, "s_texture");
            this.upointsizeloc = this.gl.getUniformLocation(shaderProgram, "u_pointsize");
            this.mvpmatrixloc = this.gl.getUniformLocation(shaderProgram, "mvp_matrix");
            this.txmatrixloc = this.gl.getUniformLocation(shaderProgram, "tx_matrix");
            this.enablestexloc = this.gl.getUniformLocation(shaderProgram, "enable_s_texture");
            this.enablevcoloc = this.gl.getUniformLocation(shaderProgram, "enable_v_color");

            var that = this;
            for (var i = 0; i < this.texture_list.length; i++) {
                var img = new Image();
                img.tex = this.gl.createTexture();
                img.onload = function() {
                    that.gl.bindTexture(that.gl.TEXTURE_2D, this.tex);
                    that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, this);
                    that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MAG_FILTER, that.gl.LINEAR);
                    that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MIN_FILTER, that.gl.LINEAR);
                    that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
                    that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);
                    that.gl.bindTexture(that.gl.TEXTURE_2D, null);
                    that.textures[this.src.split("/").pop()] = this.tex;
                    that.texloads += 1;
                    if (that.texloads == that.texture_list.length)
                        callback();
                };
                img.src = this.texture_list[i];
            }

        },
        loadShader: function(type, source) {
            var shader;
            shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
                throw Error("An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(shader));
            return shader;
        },

        uMatrixMode: function(mode) {
            if (mode == this.U_PROJECTION) {
                this.activeMatrix = this.prMatrix;
                activeStack = this.prStack;
            } else if (mode == this.U_MODELVIEW) {
                this.activeMatrix = this.mvMatrix;
                this.activeStack = this.mvStack;
            } else if (mode == this.U_TEXTURE) {
                this.activeMatrix = this.txMatrix;
                this.activeStack = this.txStack;
            }
        },

        uLoadIdentity: function() {
            this.activeMatrix[0] = 1;
            this.activeMatrix[1] = 0;
            this.activeMatrix[2] = 0;
            this.activeMatrix[3] = 0;
            this.activeMatrix[4] = 0;
            this.activeMatrix[5] = 1;
            this.activeMatrix[6] = 0;
            this.activeMatrix[7] = 0;
            this.activeMatrix[8] = 0;
            this.activeMatrix[9] = 0;
            this.activeMatrix[10] = 1;
            this.activeMatrix[11] = 0;
            this.activeMatrix[12] = 0;
            this.activeMatrix[13] = 0;
            this.activeMatrix[14] = 0;
            this.activeMatrix[15] = 1;
        },

        multiply: function(result, srcA, srcB) {

            var tmp = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

            for (var i = 0; i < 4; i++) {
                var a = 4 * i;
                var b = a + 1;
                var c = a + 2;
                var d = a + 3;
                tmp[a] = srcA[a] * srcB[0] +
                    srcA[b] * srcB[4] +
                    srcA[c] * srcB[8] +
                    srcA[d] * srcB[12];
                tmp[b] = srcA[a] * srcB[1] +
                    srcA[b] * srcB[5] +
                    srcA[c] * srcB[9] +
                    srcA[d] * srcB[13];
                tmp[c] = srcA[a] * srcB[2] +
                    srcA[b] * srcB[6] +
                    srcA[c] * srcB[10] +
                    srcA[d] * srcB[14];
                tmp[d] = srcA[a] * srcB[3] +
                    srcA[b] * srcB[7] +
                    srcA[c] * srcB[11] +
                    srcA[d] * srcB[15];
            }
            for (var i = 0; i < 16; i++)
                result[i] = tmp[i];
        },

        uMultMatrix: function(mat) {
            this.multiply(this.activeMatrix, mat, this.activeMatrix);
        },

        uTranslatef: function(x, y, z) {
            var m = this.activeMatrix;
            m[12] += m[0] * x + m[4] * y + m[8] * z;
            m[13] += m[1] * x + m[5] * y + m[9] * z;
            m[14] += m[2] * x + m[6] * y + m[10] * z;
            m[15] += m[3] * x + m[7] * y + m[11] * z;
        },

        uRotatef: function(angle, x, y, z) {
            angle = -angle;
            var c = Math.cos(angle * Math.PI / 180.0);
            var s = Math.sin(angle * Math.PI / 180.0);
            var omc = 1.0 - c;
            var mag = Math.sqrt(x * x + y * y + z * z);
            if (mag != 0.0 && mag != 1.0) {
                x = x / mag;
                y = y / mag;
                z = z / mag;
            }

            var xy = x * y;
            var yz = y * z;
            var zx = z * x;
            var ys = y * s;
            var xs = x * s;
            var zs = z * s;

            var rot = new Float32Array([omc * x * x + c, omc * xy - zs, omc * zx + ys, 0.0,
                omc * xy + zs, omc * y * y + c, omc * yz - xs, 0.0,
                omc * zx - ys, omc * yz + xs, omc * z * z + c, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
            this.uMultMatrix(rot);
        },

        uScalef: function(x, y, z) {
            this.activeMatrix[0] *= x;
            this.activeMatrix[1] *= x;
            this.activeMatrix[2] *= x;
            this.activeMatrix[3] *= x;

            this.activeMatrix[4] *= y;
            this.activeMatrix[5] *= y;
            this.activeMatrix[6] *= y;
            this.activeMatrix[7] *= y;

            this.activeMatrix[8] *= z;
            this.activeMatrix[9] *= z;
            this.activeMatrix[10] *= z;
            this.activeMatrix[11] *= z;
        },

        uOrthof: function(left, right, bottom, top, near, far) {
            var dX = right - left;
            var dY = top - bottom;
            var dZ = far - near;
            var orth = new Float32Array([2 / dX, 0, 0, 0,
                0, 2 / dY, 0, 0,
                0, 0, -2 / dZ, 0, -(right + left) / dX, -(top + bottom) / dY, -(near + far) / dZ, 1.0
            ]);
            this.uMultMatrix(orth);
        },

        uPushMatrix: function() {
            var store = new Float32Array(16);
            for (var i = 0; i < 16; i++)
                store[i] = this.activeMatrix[i];
            this.activeStack.push(store);
        },

        uPopMatrix: function() {
            var restore = this.activeStack.pop();
            for (var i = 0; i < 16; i++)
                this.activeMatrix[i] = restore[i];
        },

        uColor4f: function(r, g, b, a) {
            this.ucolr = r;
            this.ucolg = g;
            this.ucolb = b;
            this.ucola = a;
        },

        uPointSize: function(size) {
            this.upointsize = size;
        },

        uVertexPointer: function(size, type, stride, buf) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
            this.gl.vertexAttribPointer(this.vertexPos, size, type, false, size * 4, 0);
            this.gl.enableVertexAttribArray(this.vertexPos);
        },


        uColorPointer: function(size, type, stride, buf) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
            this.gl.vertexAttribPointer(this.colorPos, size, type, false, size * 4, 0);
            this.gl.enableVertexAttribArray(this.colorPos);
        },

        uTexCoordPointer: function(size, type, stride, buf) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
            this.gl.vertexAttribPointer(this.texCoordPos, size, type, false, size * 4, 0);
            this.gl.enableVertexAttribArray(this.texCoordPos);
        },


        uEnableClientState: function(state) {
            if (state == this.U_TEXTURE_COORD_ARRAY)
                this.enablestex = true;
            else if (state == this.U_COLOR_ARRAY)
                this.enablevco = true;
        },

        uDisableClientState: function(state) {
            if (state == this.U_TEXTURE_COORD_ARRAY)
                this.enablestex = false;
            else if (state == this.U_COLOR_ARRAY)
                this.enablevco = false;
        },

        uDrawArrays: function(mode, first, count) {
            this.gl.uniform1i(this.enablestexloc, this.enablestex);
            this.gl.uniform1i(this.enablevcoloc, this.enablevco);
            this.gl.uniform1f(this.upointsizeloc, this.upointsize);
            this.gl.uniform4f(this.ucolorloc, this.ucolr, this.ucolg, this.ucolb, this.ucola);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.uniform1i(this.stextureloc, 0);
            this.multiply(this.mvpMatrix, this.mvMatrix, this.prMatrix);
            this.gl.uniformMatrix4fv(this.mvpmatrixloc, false, this.mvpMatrix);
            this.gl.uniformMatrix4fv(this.txmatrixloc, false, this.txMatrix);
            if (!this.enablestex)
                this.gl.disableVertexAttribArray(this.texCoordPos);
            if (!this.enablevco)
                this.gl.disableVertexAttribArray(this.colorPos);
            this.gl.drawArrays(mode, first, count);
        },

        checkError: function(source) {
            var error = this.gl.getError();
            if (error == this.gl.NO_ERROR)
                return;
            throw Error("OpenMilk Error from " + source + ": " + error);
        }
    }

    Milk.getInstance = function() {
        if (instance == null) {
            instance = new Milk('canvas');
        }
        return instance;
    }

    return Milk;
});