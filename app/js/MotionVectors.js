define('MotionVectors', ['RenderItem', 'Milk'], function(RenderItem, Milk) {
    MotionVectors.prototype = new RenderItem();
    MotionVectors.constructor = MotionVectors;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function MotionVectors(literal) {
        this.r = 0.0;
        this.g = 0.0;
        this.b = 0.0;
        this.a = 0.0;
        this.length = 0.0;
        this.x_num = 0.0;
        this.y_num = 0.0;
        this.x_offset = 0.0;
        this.y_offset = 0.0;

        RenderItem.call(this, literal);
        this.points = new Float32Array(Math.floor(this.x_num * this.y_num) * 2);
        this.pointsbuf = gl.createBuffer();
    }

    MotionVectors.prototype.Draw = function() {
        milk.uEnableClientState(milk.U_VERTEX_ARRAY);
        milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
        milk.uDisableClientState(milk.U_COLOR_ARRAY);

        var intervalx = 1.0 / this.x_num;
        var intervaly = 1.0 / this.y_num;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        milk.uPointSize(this.length);
        milk.uColor4f(this.r, this.g, this.b, this.a * this.masterAlpha);

        if (this.x_num + this.y_num < 600) {
            var size = Math.floor(this.x_num * this.y_num);
            if (size > 0) {
                if (this.points.length < (size * 2))
                    this.points = new Float32Array(size * 2);
                for (var x = 0; x < Math.floor(this.x_num); x++)
                    for (var y = 0; y < Math.floor(this.y_num); y++) {
                        var lx, ly;
                        lx = this.x_offset + x * intervalx;
                        ly = this.y_offset + y * intervaly;
                        this.points[(x * Math.floor(this.y_num)) + y][0] = lx;
                        this.points[(x * Math.floor(this.y_num)) + y][1] = ly;
                    }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
                gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
                milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
                milk.uDrawArrays(gl.POINTS, 0, size);
            }
        }
    }
    return MotionVectors;
});