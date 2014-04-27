define("RenderContext", function() {
    function RenderContext() {
        this.time = 0;
        this.texsize = 1024;
        this.aspectRatio = 1;
        this.aspectCorrect = false;
    }
    return RenderContext;
});