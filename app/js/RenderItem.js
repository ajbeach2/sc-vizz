define("RenderItem", function() {
    function RenderItem(literal) {
        this.masterAlpha = 1.0;
        for (var prop in literal) {
            this[prop] = literal[prop];
        }
    }
    RenderItem.prototype = {
        Draw: function() {

        }
    }
    return RenderItem;
})