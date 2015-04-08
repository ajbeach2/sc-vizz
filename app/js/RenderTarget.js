define("RenderTarget", ["Milk"], function(Milk) {

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function RenderTarget(texsize, width, height) {
        var mindim = 0;
        var origtexsize = 0;
        this.texsize = texsize;

        var fb, depth_rb, rgba_tex, other_tex;
        fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        depth_rb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depth_rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.texsize, this.texsize);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth_rb);
        this.fbuffer = [fb];
        this.depthb = [depth_rb];

        other_tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, other_tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.texsize, this.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        rgba_tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, rgba_tex);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.texsize, this.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rgba_tex, 0);
        this.textureID = [rgba_tex, other_tex];
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            print("ERR FRAMEBUFFER STATUS: " + status);
    }

    RenderTarget.prototype = {
        lock: function() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbuffer[0]);
        },

        unlock: function() {
            gl.bindTexture(gl.TEXTURE_2D, this.textureID[1]);
            gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, this.texsize, this.textsize);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        },

        nearestPower2: function(value, scaleRule) {
            var x = value;
            var power = 0;
            while ((x & 0x01) != 1)
                x >>= 1;
            if (x == 1) return value;
            x = value;
            while (x != 0) {
                x >>= 1;
                power++;
            }
            if (scaleRule == this.SCALE_NEAREST) {
                if (((1 << power) - value) <= (value - (1 << (power - 1))))
                    return 1 << power;
                else
                    return 1 << (power - 1);
            }
            if (scaleRule == this.SCALE_MAGNIFY)
                return 1 << power;
            if (scaleRule == this.SCALE_MINIFY)
                return 1 << (power - 1);
            return 0;
        },

        SCALE_NEAREST: 0,
        SCALE_MAGNIFY: 1,
        SCALE_MINIFY: 2
    }

    return RenderTarget;
});