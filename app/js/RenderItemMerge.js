define('RenderItemMerge', ["RenderItemMergeFunction"], function(RenderItemMergeFunction) {

    RenderItemMerge.prototype = new RenderItemMergeFunction();
    RenderItemMerge.constructor = RenderItemMerge;

    function RenderItemMerge() {

    }

    RenderItemMerge.prototype = {
        supported: function() {
            return false;
        },

        typeIdPair: function() {
            return ["", ""];
        },
    }

    return RenderItemMerge;
});