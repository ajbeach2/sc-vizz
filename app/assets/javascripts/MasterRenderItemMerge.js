define('MasterRenderItemMerge', ["RenderItemMerge"], function(RenderItemMerge) {

    MasterRenderItemMerge.prototype = new RenderItemMerge();
    MasterRenderItemMerge.constructor = MasterRenderItemMerge;

    function MasterRenderItemMerge() {

    }

    MasterRenderItemMerge.prototype.add = function(fun) {
        this.mergeFunctionMap[fun.typeIdPair()] = fun;
    }

    return MasterRenderItemMerge;
});