define('Border', ["RenderItem", "Milk"], function(RenderItem, Milk) {
    Border.prototype = new RenderItem();
    Border.constructor = Border;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function Border(literal) {
        this.outer_size = 0;
        this.outer_r = 0;
        this.outer_g = 0;
        this.outer_b = 0;
        this.outer_a = 0;

        this.inner_size = 0;
        this.inner_r = 0;
        this.inner_g = 0;
        this.inner_b = 0;
        this.inner_a = 0;

        RenderItem.call(this, literal);

        this.pointsA = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]);
        this.pointsB = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0]);
        this.pointsC = new Float32Array([1, 0, 1, 1, 1, 0, 1, 1]);
        this.pointsD = new Float32Array([0, 1, 0, 1, 1, 1, 1, 1]);
        this.pointsE = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]);
        this.pointsF = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0]);
        this.pointsG = new Float32Array([1, 0, 1, 0, 1, 0, 1, 1]);
        this.pointsH = new Float32Array([0, 1, 0, 1, 1, 1, 1, 1]);

        this.pointsAbuf = gl.createBuffer();
        this.pointsBbuf = gl.createBuffer();
        this.pointsCbuf = gl.createBuffer();
        this.pointsDbuf = gl.createBuffer();
        this.pointsEbuf = gl.createBuffer();
        this.pointsFbuf = gl.createBuffer();
        this.pointsGbuf = gl.createBuffer();
        this.pointsHbuf = gl.createBuffer();
    }

    Border.prototype.Draw = function() {
        milk.uEnableClientState(milk.U_VERTEX_ARRAY);
        milk.uDisableClientState(milk.U_COLOR_ARRAY);
        milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);

        var of = this.outer_size * .5;
        var iff = this.inner_size * .5;
        var texof = 1.0 - of;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        milk.uColor4f(this.outer_r, this.outer_g, this.outer_b, this.outer_a * this.masterAlpha);

        this.pointsA[4] = this.pointsA[6] = of;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsAbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsA, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsAbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsB[0] = this.pointsB[2] = this.pointsB[3] = this.pointsB[7] = of;
        this.pointsB[4] = this.pointsB[6] = texof;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsBbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsB, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsBbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsC[0] = this.pointsC[2] = texof;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsCbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsC, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsCbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsD[0] = this.pointsD[2] = of;
        this.pointsD[3] = this.pointsD[4] = this.pointsD[6] = this.pointsD[7] = texof;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsDbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsD, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsDbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        milk.uColor4f(this.inner_r, this.inner_g, this.inner_b, this.inner_a * this.masterAlpha);

        this.pointsE[0] = this.pointsE[1] = this.pointsE[2] = this.pointsE[5] = of;
        this.pointsE[3] = this.pointsE[7] = texof;
        this.pointsE[4] = this.pointsE[6] = of + iff;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsEbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsE, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsEbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsF[1] = this.pointsF[5] = of;
        this.pointsF[0] = this.pointsF[2] = this.pointsF[3] = this.pointsF[7] = of + iff;
        this.pointsF[4] = this.pointsF[6] = texof - iff;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsFbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsF, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsFbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsG[1] = this.pointsG[5] = of;
        this.pointsG[3] = this.pointsG[4] = this.pointsG[6] = this.pointsG[7] = texof;
        this.pointsG[0] = this.pointsG[2] = texof - iff;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsGbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsG, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsGbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this.pointsH[1] = this.pointsH[5] = texof;
        this.pointsH[0] = this.pointsH[2] = of + iff;
        this.pointsH[3] = this.pointsH[4] = this.pointsH[6] = this.pointsH[7] = texof - iff;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsHbuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.pointsH, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsHbuf);
        milk.uDrawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    return Border;
});