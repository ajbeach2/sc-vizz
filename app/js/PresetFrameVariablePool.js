define('PresetFrameVariablePool', ["PresetVariablePool"], function(PresetVariablePool) {

    PresetFrameVariablePool.prototype = new PresetVariablePool();
    PresetFrameVariablePool.constructor = PresetFrameVariablePool;

    function PresetFrameVariablePool() {
        PresetVariablePool.call(this);
        this.addOutputs(['wave_x', 'wave_y', 'wave_r', 'wave_g', 'wave_b', 'wave_a', 'wave_mode',
            'wave_mystery', 'wave_usedots', 'wave_thick', 'wave_additive', 'wave_brighten',
            'ob_size', 'ob_r', 'ob_g', 'ob_b', 'ob_a', 'ib_size', 'ib_r', 'ib_g', 'ib_b',
            'ib_a', 'mv_r', 'mv_g', 'mv_b', 'mv_a', 'mv_x', 'mv_y', 'mv_l', 'mv_dx', 'mv_dy',
            'decay', 'gamma', 'echo_zoom', 'echo_alpha', 'echo_orient', 'darken_center',
            'wrap', 'invert', 'brighten', 'darken', 'solarize'
        ]);

    }
    return PresetFrameVariablePool;
});