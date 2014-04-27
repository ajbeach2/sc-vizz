define('PresetPixelVariablePool', ["PresetVariablePool"], function(PresetVariablePool) {

    PresetPixelVariablePool.prototype = new PresetVariablePool();
    PresetPixelVariablePool.constructor = PresetPixelVariablePool;

    function PresetPixelVariablePool() {
        PresetVariablePool.call(this);
        this.addOutputs(['x', 'y', 'rad', 'ang']);
    }
    return PresetPixelVariablePool;
});