define('DarkenCenter', ["RenderItem", "ShapeFrameVariablePool", "Milk"], function(RenderItem, ShapeFrameVariablePool, Milk) {
    DarkenCenter.prototype = new RenderItem();
    DarkenCenter.constructor = DarkenCenter;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function DarkenCenter(literal) {
        RenderItem.call(this, literal);

        this.colors = new Float32Array([0, 0, 0, 3. / 32 * this.masterAlpha, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        this.points = new Float32Array([0.5, 0.5, 0.45, 0.5, 0.5, 0.45, 0.55, 0.5, 0.5, 0.55, 0.45, 0.5]);
        this.colorbuf = gl.createBuffer();
        this.pointsbuf = gl.createBuffer();
    }

    DarkenCenter.prototype.Draw = function(context) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.colors[3] = 3 / 32 * this.masterAlpha;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

        milk.uEnableClientState(milk.U_VERTEX_ARRAY);
        milk.uEnableClientState(milk.U_COLOR_ARRAY);
        milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
        milk.uColorPointer(4, gl.FLOAT, 0, this.colorbuf);
        milk.uDrawArrays(gl.TRIANGLE_FAN, 0, 6);
    }

    return DarkenCenter;
});