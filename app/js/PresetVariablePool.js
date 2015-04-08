define('PresetVariablePool', ["VariablePool"], function(VariablePool) {

    PresetVariablePool.prototype = new VariablePool();
    PresetVariablePool.constructor = PresetVariablePool;

    function PresetVariablePool() {
        VariablePool.call(this);
        this.addOutputs(['zoom', 'zoomexp', 'rot', 'warp', 'cx', 'cy', 'dx', 'dy', 'sx', 'sy']);
        this.addInputs(['meshx', 'meshy', 'aspectx', 'aspecty']);
    }
    return PresetVariablePool;
});