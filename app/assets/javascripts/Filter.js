define('Filter', ["RenderItem"], function(RenderItem) {
    Filter.prototype = new RenderItem();
    Filter.constructor = Filter;

    function Filter(literal) {
        RenderItem.call(this, literal);
        this.points = new Float32Array([-.5, -.5, -.5, .5, .5, .5, .5, -.5]);
        this.pointsbuf = gl.createBuffer();
    }

    return Filter;
});