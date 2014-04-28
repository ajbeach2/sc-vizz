define('Shape', ["RenderItem", "Milk", "ShapeFrameVariablePool"], function(RenderItem, Milk, ShapeFrameVariablePool) {
    Shape.prototype = new RenderItem();
    Shape.constructor = Shape;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function Shape(literal, initialQs) {
        this.sides = 4;
        this.thickOutline = false;
        this.enabled = true;
        this.additive = false;
        this.textured = false;

        this.tex_zoom = 1.0;
        this.tex_ang = 0.0;

        this.x = 0.5;
        this.y = 0.5;
        this.rad = 1.0;
        this.ang = 0.0;

        this.r = 0.0;
        this.g = 0.0;
        this.b = 0.0;
        this.a = 0.0;

        this.r2 = 0.0;
        this.g2 = 0.0;
        this.b2 = 0.0;
        this.a2 = 0.0;

        this.border_r = 0.0;
        this.border_g = 0.0;
        this.border_b = 0.0;
        this.border_a = 0.0;

        this.ImageUrl = "";

        this.init_code = function() {};
        this.per_frame_code = function() {};

        RenderItem.call(this, literal);
        this.initialVals = new ShapeFrameVariablePool();
        this.initialVals.pushOutputs(this);

        this.framePool = new ShapeFrameVariablePool();
        this.varInit();
        this.framePool.pushQs(initialQs);
        this.init_code(this.framePool);
        this.initialTs = new Float32Array(8);
        this.framePool.popTs(this.initialTs);

        this.colors = new Float32Array((this.sides + 2) * 4);
        this.texcoords = new Float32Array((this.sides + 2) * 2);
        this.points = new Float32Array((this.sides + 2) * 2);
        this.points2 = new Float32Array((this.sides + 1) * 2);

        this.colorbuf = gl.createBuffer();
        this.texbuf = gl.createBuffer();
        this.pointsbuf = gl.createBuffer();
        this.points2buf = gl.createBuffer();
    }
    Shape.prototype = {
        varInit: function() {
            var testPool = new ShapeFrameVariablePool();
            for (var i = 0; i < 30; i++)
                try {
                    this.init_code(testPool);
                    this.per_frame_code(testPool);
                    break;
                } catch (error) {
                    if (error.name == "ReferenceError") {
                        var customVar;
                        if (error.message.indexOf("Can't find variable:") == 0)
                            customVar = error.message.split(" ").pop();
                        else
                            customVar = error.message.split(" ")[0];
                        this.framePool[customVar] = 0;
                        testPool[customVar] = 0;
                    } else
                        throw error;
                }
        },

        runCode: function() {
            this.framePool.pushTs(this.initialTs);
            this.initialVals.popOutputs(this.framePool);
            this.per_frame_code(this.framePool);
            this.framePool.popOutputs(this);
        },

        Draw: function(context) {

            var xval, yval, t;
            var temp_radius = this.rad * (.707 * .707 * .707 * 1.04);
            gl.enable(gl.BLEND);
            if (this.additive == 0)
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            else
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

            xval = this.x;
            yval = -(this.y - 1);

            if (this.textured) {
                if (this.ImageUrl != "") {
                    var tex = milk.textures[this.ImageUrl];
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    context.aspectRatio = 1.0;
                }

                milk.uMatrixMode(milk.U_TEXTURE);
                milk.uPushMatrix();
                milk.uLoadIdentity();

                milk.uEnableClientState(milk.U_VERTEX_ARRAY);
                milk.uEnableClientState(milk.U_COLOR_ARRAY);
                milk.uEnableClientState(milk.U_TEXTURE_COORD_ARRAY);

                milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
                milk.uColorPointer(4, gl.FLOAT, 0, this.colorbuf);
                milk.uTexCoordPointer(2, gl.FLOAT, 0, this.texbuf);

                this.colors[0] = this.r;
                this.colors[1] = this.g;
                this.colors[2] = this.b;
                this.colors[3] = this.a * this.masterAlpha;
                this.texcoords[0] = 0.5;
                this.texcoords[1] = 0.5;
                this.points[0] = xval;
                this.points[1] = yval;

                for (var i = 1; i < this.sides + 2; i++) {

                    this.colors[i * 4] = this.r2;
                    this.colors[i * 4 + 1] = this.g2;
                    this.colors[i * 4 + 2] = this.b2;
                    this.colors[i * 4 + 3] = this.a2 * this.masterAlpha;

                    t = (i - 1) / this.sides;
                    this.texcoords[i * 2] = 0.5 + 0.5 * Math.cos(t * 3.1415927 * 2 + this.tex_ang + 3.1415927 * 0.25) * (context.aspectCorrect ? context.aspectRatio : 1.0) / this.tex_zoom;
                    this.texcoords[i * 2 + 1] = 0.5 + 0.5 * Math.sin(t * 3.1415927 * 2 + this.tex_ang + 3.1415927 * 0.25) / this.tex_zoom;
                    this.points[i * 2] = temp_radius * Math.cos(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) * (context.aspectCorrect ? context.aspectRatio : 1.0) + xval;
                    this.points[i * 2 + 1] = temp_radius * Math.sin(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) + yval;

                }

                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.texcoords, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

                milk.uDrawArrays(gl.TRIANGLE_FAN, 0, this.sides + 2);

                milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
                milk.uPopMatrix();
                milk.uMatrixMode(milk.U_MODELVIEW);

            } else {
                milk.uEnableClientState(milk.U_VERTEX_ARRAY);
                milk.uEnableClientState(milk.U_COLOR_ARRAY);
                milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
                milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
                milk.uColorPointer(4, gl.FLOAT, 0, this.colorbuf);

                this.colors[0] = this.r;
                this.colors[1] = this.g;
                this.colors[2] = this.b;
                this.colors[3] = this.a * this.masterAlpha;
                this.points[0] = xval;
                this.points[1] = yval;

                for (var i = 1; i < this.sides + 2; i++) {
                    this.colors[i * 4] = this.r2;
                    this.colors[i * 4 + 1] = this.g2;
                    this.colors[i * 4 + 2] = this.b2;
                    this.colors[i * 4 + 3] = this.a2 * this.masterAlpha;
                    t = (i - 1) / this.sides;
                    this.points[i * 2] = temp_radius * Math.cos(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) * (context.aspectCorrect ? context.aspectRatio : 1.0) + xval;
                    this.points[i * 2 + 1] = temp_radius * Math.sin(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) + yval;
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

                milk.uDrawArrays(gl.TRIANGLE_FAN, 0, this.sides + 2);

            }
            if (this.thickOutline)
                gl.lineWidth(context.texsize < 512 ? 1 : 2 * context.texsize / 512);


            milk.uEnableClientState(milk.U_VERTEX_ARRAY);
            milk.uDisableClientState(milk.U_COLOR_ARRAY);
            milk.uVertexPointer(2, gl.FLOAT, 0, this.points2buf);

            milk.uColor4f(this.border_r, this.border_g, this.border_b, this.border_a * this.masterAlpha);

            for (var i = 0; i < this.sides; i++) {
                t = (i - 1) / this.sides;
                this.points2[i * 2] = temp_radius * Math.cos(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) * (context.aspectCorrect ? context.aspectRatio : 1.0) + xval;
                this.points2[i * 2 + 1] = temp_radius * Math.sin(t * 3.1415927 * 2 + this.ang + 3.1415927 * 0.25) + yval;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.points2buf);
            gl.bufferData(gl.ARRAY_BUFFER, this.points2, gl.STATIC_DRAW);

            milk.uDrawArrays(gl.LINE_LOOP, 0, this.sides);
            if (this.thickOutline)
                gl.lineWidth(context.texsize < 512 ? 1 : context.texsize / 512);
        }
    }
    return Shape;
});