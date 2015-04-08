define('CustomVariablePool', ["VariablePool"], function(VariablePool) {

    CustomVariablePool.prototype = new VariablePool();
    CustomVariablePool.constructor = CustomVariablePool;

    function CustomVariablePool() {
        VariablePool.call(this);
        this.addOutputs(['x', 'y', 'rad', 'ang']);
    }

    CustomVariablePool.prototype.pushTs = function(array) {
        for (var i = 1; i <= 8; i++)
            this["t" + i] = array[i - 1];
    }

    CustomVariablePool.prototype.popTs = function(array) {
        for (var i = 1; i <= 8; i++)
            array[i - 1] = this["t" + i];
    }

    CustomVariablePool.prototype.transferTs = function(pool) {
        for (var i = 1; i <= 8; i++)
            pool["t" + i] = this["t" + i];
    }

    return CustomVariablePool;
});