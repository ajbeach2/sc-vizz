define("PerPixelMesh", ["MPoint", "PerPixelContext"], function(MPoint, PerPixelContext) {
    function PerPixelMesh(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;
        this.p = new Array(this.size);
        this.p_original = new Array(this.size);
        this.identity = new Array(this.size);
        for (var i = 0; i < this.size; i++) {
            this.p[i] = new MPoint(0, 0);
            this.p_original[i] = new MPoint(0, 0);
            this.identity[i] = new PerPixelContext(0, 0, 0, 0, 0);
        }
        for (var j = 0; j < this.height; j++)
            for (var i = 0; i < this.width; i++) {
                var index = j * this.width + i;
                var xval = i / (this.width - 1.);
                var yval = -((j / (this.height - 1.)) - 1.);
                this.p[index].x = xval;
                this.p[index].y = yval;
                this.p_original[index].x = xval;
                this.p_original[index].y = yval;
                this.identity[index].x = xval;
                this.identity[index].y = yval;
                this.identity[index].i = i;
                this.identity[index].j = j;
                this.identity[index].rad = Math.sqrt(Math.pow((xval - .5) * 2, 2) + Math.pow((yval - .5) * 2, 2));
                this.identity[index].theta = Math.atan2((yval - .5) * 2, (xval - .5) * 2);
            }
    }

    PerPixelMesh.prototype.Reset = function() {
        for (var i = 0; i < this.size; i++) {
            this.p[i].x = this.p_original[i].x;
            this.p[i].y = this.p_original[i].y;
        }
    }

    return PerPixelMesh;
});