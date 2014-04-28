define('VideoEcho', ["RenderItem", "Orientation", "Milk"], function(RenderItem, Orientation, Milk) {
        VideoEcho.prototype = new RenderItem();
        VideoEcho.constructor = VideoEcho;

        var milk = Milk.getInstance()
        var gl = milk.gl;

        function VideoEcho(literal) {
            this.a = 0;
            this.zoom = 0;
            this.orientation = Orientation.Normal;

            RenderItem.call(this, literal);

            this.tex = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
            this.points = new Float32Array([-.5, -.5, -.5, .5, .5, .5, .5, -.5]);
            this.pointsFlip = new Float32Array(8);
            this.texbuf = gl.createBuffer();
            this.pointsbuf = gl.createBuffer();
            this.pointsFlipbuf = gl.createBuffer();
        }

        VideoEcho.prototype.Draw = function(context) {

            milk.uEnableClientState(U_VERTEX_ARRAY);
            milk.uDisableClientState(U_COLOR_ARRAY);
            milk.uEnableClientState(U_TEXTURE_COORD_ARRAY);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);
            milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsbuf);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.tex, gl.STATIC_DRAW);
            milk.uTexCoordPointer(2, gl.FLOAT, 0, this.tex);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            milk.uMatrixMode(U_TEXTURE);

            milk.uColor4f(1.0, 1.0, 1.0, this.a * this.masterAlpha);
            milk.uTranslatef(.5, .5, 0);
            milk.uScalef(1.0 / this.zoom, 1.0 / this.zoom, 1);
            milk.uTranslatef(-.5, -.5, 0);

            var flipx = 1,
                flipy = 1;
            switch (this.orientation) {
                case Orientation.Normal:
                    flipx = 1;
                    flipy = 1;
                    break;
                case Orientation.FlipX:
                    flipx = -1;
                    flipy = 1;
                    break;
                case Orientation.FlipY:
                    flipx = 1;
                    flipy = -1;
                    break;
                case Orientation.FlipXY:
                    flipx = -1;
                    flipy = -1;
                    break;
                default:
                    flipx = 1;
                    flipy = 1;
                    break;
            }

            this.pointsFlip[0] = this.pointsFlip[2] = -.5 * flipx;
            this.pointsFlip[1] = this.pointsFlip[7] = -.5 * flipy;
            this.pointsFlip[3] = this.pointsFlip[5] = .5 * flipy;
            this.pointsFlip[4] = this.pointsFlip[6] = .5 * flipx;

            gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsFlipbuf);
            gl.bufferData(gl.ARRAY_BUFFER, this.pointsFlip, gl.STATIC_DRAW);
            milk.uVertexPointer(2, gl.FLOAT, 0, this.pointsFlipbuf);
            milk.uDrawArrays(gl.TRIANGLE_FAN, 0, 4);

            milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        }
    }
    return VideoEcho;
});