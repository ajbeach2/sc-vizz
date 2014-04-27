define('WaveFrameVariablePool', ["CustomVariablePool"], function(CustomVariablePool) {

    WaveFrameVariablePool.prototype = new CustomVariablePool();
    WaveFrameVariablePool.constructor = WaveFrameVariablePool;

    function WaveFrameVariablePool() {
        CustomVariablePool.call(this);
    }

    return WaveFrameVariablePool;
});