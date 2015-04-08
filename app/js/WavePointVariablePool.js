define('WavePointVariablePool', ["CustomVariablePool"], function(CustomVariablePool) {

    WavePointVariablePool.prototype = new CustomVariablePool();
    WavePointVariablePool.constructor = WavePointVariablePool;

    function WavePointVariablePool() {
        CustomVariablePool.call(this);
        this.addOutputs(['x', 'y', 'sample', 'value1', 'value2']);
    }

    return WavePointVariablePool;
});