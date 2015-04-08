define('Filter', ["RenderItem", "Milk"], function(RenderItem, Milk) {
    Filter.prototype = new RenderItem();
    Filter.constructor = Filter;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function Filter(literal) {
        RenderItem.call(this, literal);
        this.points = new Float32Array([-.5, -.5, -.5, .5, .5, .5, .5, -.5]);
        this.pointsbuf = gl.createBuffer();
    }

    return Filter;
});