define('Brighten', ["Filter"], functon(Filter) {

    Brighten.prototype = new Filter();
    Brighten.constructor = Brighten;

    function Brighten(literal) {
        Filter.call(this, literal);
    }

    Brighten.prototype.Draw = function(context) {
        uEnableClientState(U_VERTEX_ARRAY);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
        uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
        uColor4f(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ZERO);
        uDrawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.blendFunc(gl.ZERO, gl.DST_COLOR);
        uDrawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ZERO);
        uDrawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        uDisableClientState(U_VERTEX_ARRAY);
    }

    return Brighten;
})