define("VariablePool", function() {
    function VariablePool() {
        this.inputs = [];
        this.outputs = [];
        this.addInputs(["time", "fps", "frame", "progress", "bass", "mid", "treb",
            "bass_att", "mid_att", "treb_att"
        ]);
        for (i = 1; i <= 32; i++)
            this["q" + i] = 0;
    }

    VariablePool.prototype = {
        addInputs: function(ownInputs) {
            for (var i = 0; i < ownInputs.length; i++) {
                this.inputs.push(ownInputs[i]);
                this[ownInputs[i]] = 0;
            }
        },

        addOutputs: function(ownOutputs) {
            for (var i = 0; i < ownOutputs.length; i++) {
                this.outputs.push(ownOutputs[i]);
                this[ownOutputs[i]] = 0;
            }
        },

        pushQs: function(array) {
            for (var i = 1; i <= 32; i++)
                this["q" + i] = array[i - 1];
        },

        popQs: function(array) {
            for (var i = 1; i <= 32; i++)
                array[i - 1] = this["q" + i];
        },

        transferQs: function(pool) {
            for (var i = 1; i <= 32; i++)
                pool["q" + i] = this["q" + i];
        },

        pushOutputs: function(pool) {
            for (var i = 0; i < this.outputs.length; i++)
                this[this.outputs[i]] = pool[this.outputs[i]];
        },

        popOutputs: function(pool) {
            for (var i = 0; i < this.outputs.length; i++)
                pool[this.outputs[i]] = this[this.outputs[i]];
        },

        pushInputs: function(pool) {
            for (var i = 0; i < this.inputs.length; i++)
                this[this.inputs[i]] = pool[this.inputs[i]];
        },

        cos: Math.cos,
        sin: Math.sin,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        abs: Math.abs,
        pow: Math.pow,
        min: Math.min,
        max: Math.max,
        sqrt: Math.sqrt,
        log: Math.log,
        above: function(arg1, arg2) {
            return arg1 > arg2;
        },
        below: function(arg1, arg2) {
            return arg1 < arg2;
        },
        equal: function(arg1, arg2) {
            return arg1 == arg2;
        },
        ifcond: function(arg1, arg2, arg3) {
            return arg1 ? arg2 : arg3;
        },
        sign: function(arg1) {
            return (arg1 > 0) - (arg1 < 0);
        },
        int: function(arg1) {
            return Math.floor(arg1);
        },
        sqr: function(arg1) {
            return Math.pow(arg1, 2);
        },
        sigmoid: function(arg1, arg2) {
            return 65534 / (1 + Math.exp(arg1 * arg2 / -32767) - 32767);
        },
        rand: function(arg1) {
            return Math.floor(Math.random() * arg1);
        },
        bor: function(arg1, arg2) {
            return (arg1 != 0) || (arg2 != 0);
        },
        band: function(arg1, arg2) {
            return (arg1 != 0) && (arg2 != 0);
        },
        bnot: function(arg1) {
            return arg1 == 0 ? 1 : 0
        },
        exp: Math.exp,
        atan2: Math.atan2,
        log10: function(arg1) {
            return Math.log(arg1, 10);
        },
    }
    return VariablePool;
});