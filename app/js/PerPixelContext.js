define("PerPixelContext", function() {
    function PerPixelContext(x, y, rad, theta, i, j) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.theta = theta;
        this.i = i;
        this.j = j;
    }
    return PerPixelContext;
});