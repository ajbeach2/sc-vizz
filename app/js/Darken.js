define('Darken', ["Filter", "Milk"], function(Filter, Milk) {

    Darken.prototype = new Filter();
    Darken.constructor = Darken;


    var milk = Milk.getInstance();
    var gl = milk.gl;

    function Darken(literal) {
        Filter.call(this, literal);
    }

    Darken.prototype.Draw = function(context) {
        milk.uEnableClientState(milk.U_VERTEX_ARRAY);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);
        milk.uColor4f(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ZERO, gl.DST_COLOR);
        milk.uDrawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        milk.uDisableClientState(milk.U_VERTEX_ARRAY);
    }

    return Darken;
})