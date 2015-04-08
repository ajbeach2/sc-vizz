define('MilkdropWaveform', ['WaveMode', 'RenderItem', "Milk"], function(WaveMode, RenderItem, Milk) {

    MilkdropWaveform.prototype = new RenderItem();
    MilkdropWaveform.constructor = MilkdropWaveform;

    var milk = Milk.getInstance();
    var gl = milk.gl;

    function MilkdropWaveform(literal) {

        this.x = 0.5;
        this.y = 0.5;
        this.r = 1;
        this.g = 0;
        this.b = 0;
        this.a = 1;
        this.mystery = 0;
        this.mode = WaveMode.Line;
        this.additive = false;
        this.dots = false;
        this.thick = false;
        this.modulateAlphaByVolume = false;
        this.maximizeColors = false;
        this.scale = 10;
        this.smoothing = 0;
        this.rot = 0;
        this.samples = 0;
        this.modOpacityStart = 0;
        this.modOpacityEnd = 1;

        RenderItem.call(this, literal);

        this.wavearray = new Float32Array(2048 * 2);
        this.wavearray2 = new Float32Array(2048 * 2);
        this.wavearraybuf = gl.createBuffer();
        this.wavearray2buf = gl.createBuffer();
    }

    MilkdropWaveform.prototype.Draw = function(context) {
        this.WaveformMath(context);
        milk.uMatrixMode(milk.U_MODELVIEW);
        milk.uPushMatrix();
        milk.uLoadIdentity();

        if (this.modulateAlphaByVolume) {
            if (context.music.vol <= this.modOpacityStart) this.temp_a = 0.0;
            else if (context.music.vol >= this.modOpacityEnd) this.temp_a = this.a;
            else this.temp_a = this.a * ((context.music.vol - this.modOpacityStart) / (this.modOpacityEnd - this.modOpacityStart));
        } else this.temp_a = this.a;

        this.MaximizeColors(context);

        if (this.thick == 1)
            gl.lineWidth((context.texsize < 512) ? 2 : 2 * context.texsize / 512);
        else gl.lineWidth((context.texsize < 512) ? 1 : context.texsize / 512);

        gl.enable(gl.BLEND);
        if (this.additive == 1) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        milk.uTranslatef(.5, .5, 0);
        milk.uRotatef(this.rot, 0, 0, 1);
        milk.uScalef(this.aspectScale, 1.0, 1.0);
        milk.uTranslatef(-.5, -.5, 0);

        milk.uEnableClientState(milk.U_VERTEX_ARRAY);
        milk.uDisableClientState(milk.U_TEXTURE_COORD_ARRAY);
        milk.uDisableClientState(milk.U_COLOR_ARRAY);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.wavearraybuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.wavearray, gl.STATIC_DRAW);
        milk.uVertexPointer(2, gl.FLOAT, 0, this.wavearraybuf);

        if (this.loop)
            milk.uDrawArrays(gl.LINE_LOOP, 0, this.samples);
        else
            milk.uDrawArrays(gl.LINE_STRIP, 0, this.samples);


        if (this.two_waves) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.wavearray2buf);
            gl.bufferData(gl.ARRAY_BUFFER, this.wavearray2, gl.STATIC_DRAW);
            milk.uVertexPointer(2, gl.FLOAT, 0, this.wavearray2buf);
            if (this.loop)
                milk.uDrawArrays(gl.LINE_LOOP, 0, this.samples);
            else
                milk.uDrawArrays(gl.LINE_STRIP, 0, this.samples);
        }

        milk.uPopMatrix();

    }

    MilkdropWaveform.prototype.MaximizeColors = function(context) {
        var wave_r_switch = 0;
        var wave_g_switch = 0;
        var wave_b_switch = 0;

        if (this.mode == WaveMode.Blob2 || this.mode == WaveMode.Blob5)
            switch (context.texsize) {
                case 256:
                    this.temp_a *= 0.07;
                    break;
                case 512:
                    this.temp_a *= 0.09;
                    break;
                case 1024:
                    this.temp_a *= 0.11;
                    break;
                case 2048:
                    this.temp_a *= 0.13;
                    break;
            } else if (this.mode == WaveMode.Blob3) {
                switch (context.texsize) {
                    case 256:
                        this.temp_a *= 0.075;
                        break;
                    case 512:
                        this.temp_a *= 0.15;
                        break;
                    case 1024:
                        this.temp_a *= 0.22;
                        break;
                    case 2048:
                        this.temp_a *= 0.33;
                        break;
                }
                this.temp_a *= 1.3;
                this.temp_a *= Math.pow(context.music.treb, 2.0);
            }

        if (this.maximizeColors) {
            if (this.r >= this.g && this.r >= this.b) {
                wave_b_switch = this.b / this.r;
                wave_g_switch = this.g / this.r;
                wave_r_switch = 1.0;
            } else if (this.b >= this.g && this.b >= this.r) {
                wave_r_switch = this.r / this.b;
                wave_g_switch = this.g / this.b;
                wave_b_switch = 1.0;
            } else if (this.g >= this.b && this.g >= this.r) {
                wave_b_switch = this.b / this.g;
                wave_r_switch = this.r / this.g;
                wave_g_switch = 1.0;
            }
            milk.uColor4f(wave_r_switch, wave_g_switch, wave_b_switch, this.temp_a * this.masterAlpha);
        } else {
            milk.uColor4f(this.r, this.g, this.b, this.temp_a * this.masterAlpha);
        }
    }

    MilkdropWaveform.prototype.WaveformMath = function(context) {
        var i, r, theta, temp_y, cos_rot, sin_rot;
        var offset = this.x - 0.5;
        var wave_x_temp = 0;
        var wave_y_temp = 0;

        this.two_waves = false;
        this.loop = false;
        if (this.mode == WaveMode.Circle) {

            this.loop = true;
            this.rot = 0;
            this.aspectScale = 1.0;
            temp_y = -1 * (this.y - 1.0);
            this.samples = context.music.numsamples;
            var inv_nverts_minus_one = 1.0 / this.samples;
            var offset = (context.music.pcmdataR[0] + context.music.pcmdataL[0]) -
                (context.music.pcmdataR[this.samples - 1] + context.music.pcmdataL[this.samples - 1]);
            for (i = 0; i < this.samples; i++) {
                var value = context.music.pcmdataR[i] + context.music.pcmdataL[i];
                value += offset * i / this.samples;
                r = (0.5 + 0.4 * .12 * value * this.scale + this.mystery) * .5;
                theta = i * inv_nverts_minus_one * 6.28 + context.time * 0.2;
                this.wavearray[i * 2] = r * Math.cos(theta) * (context.aspectCorrect ? context.aspectRatio : 1.0) + this.x;
                this.wavearray[i * 2 + 1] = r * Math.sin(theta) + temp_y;
            }

        } else if (this.mode == WaveMode.RadialBlob) {

            this.rot = 0;
            this.aspectScale = context.aspectRatio;
            temp_y = -1 * (this.y - 1.0);
            this.samples = 512 - 32;
            for (i = 0; i < 512 - 32; i++) {
                theta = context.music.pcmdataL[i + 32] * 0.06 * this.scale * 1.57 + context.time * 2.3;
                r = (0.53 + 0.43 * context.music.pcmdataR[i] * 0.12 * this.scale + this.mystery) * .5;
                this.wavearray[i * 2] = r * Math.cos(theta) * (context.aspectCorrect ? context.aspectRatio : 1.0) + this.x;
                this.wavearray[i * 2 + 1] = r * Math.sin(theta) + temp_y;
            }

        } else if (this.mode == WaveMode.Blob2) {

            temp_y = -1 * (this.y - 1.0);
            this.rot = 0;
            this.aspectScale = 1.0;
            this.samples = 512 - 32;
            for (i = 0; i < 512 - 32; i++) {
                this.wavearray[i * 2] = context.music.pcmdataR[i] * this.scale * 0.5 + this.x;
                this.wavearray[i * 2 + 1] = context.music.pcmdataL[i + 32] * this.scale * 0.5 + temp_y;
            }

        } else if (this.mode == WaveMode.DerivativeLine) {

            this.rot = -this.mystery * 90;
            this.aspectScale = 1.0;
            temp_y = -1 * (this.y - 1.0);
            var w1 = 0.45 + 0.5 * (this.mystery * 0.5 + 0.5);
            var w2 = 1.0 - w1;
            var xx, xxm1, xxm2, yy, yym1, yym2;
            this.samples = 512 - 32;
            for (i = 0; i < 512 - 32; i++) {
                xx = -1.0 + 2.0 * i / (512 - 32) + this.x;
                yy = 0.4 * context.music.pcmdataL[i] * 0.47 * this.scale + temp_y;
                xx += 0.4 * context.music.pcmdataR[i] * 0.44 * this.scale;
                if (i > 1) {
                    xx = xx * w2 + w1 * (xxm1 * 2.0 - xxm2);
                    yy = yy * w2 + w1 * (yym1 * 2.0 - yym2);
                }
                this.wavearray[i * 2] = xx;
                this.wavearray[i * 2 + 1] = yy;
                xxm2 = xxm1;
                yym2 = yym1;
                xxm1 = xx;
                yym1 = yy;
            }

        } else if (this.mode == WaveMode.Blob5) {

            this.rot = 0;
            this.aspectScale = 1.0;
            temp_y = -1 * (this.y - 1.0);
            cos_rot = Math.cos(context.time * 0.3);
            sin_rot = Math.sin(context.time * 0.3);
            this.samples = 512 - 32;
            for (i = 0; i < 512 - 32; i++) {
                var x0 = context.music.pcmdataR[i] * context.music.pcmdataL[i + 32] + context.music.pcmdataL[i + 32] * context.music.pcmdataR[i];
                var y0 = context.music.pcmdataR[i] * context.music.pcmdataR[i] - context.music.pcmdataL[i + 32] * context.music.pcmdataL[i + 32];
                this.wavearray[i * 2] = (x0 * cos_rot - y0 * sin_rot) * this.scale * 0.5 * (context.aspectCorrect ? context.aspectRatio : 1.0) + this.x;
                this.wavearray[i * 2 + 1] = (x0 * sin_rot + y0 * cos_rot) * this.scale * 0.5 + temp_y;
            }

        } else if (this.mode == WaveMode.Line) {
            wave_x_temp = -2 * 0.4142 * (Math.abs(Math.abs(this.mystery) - .5) - .5);
            this.rot = -this.mystery * 90;
            this.aspectScale = 1.0 + wave_x_temp;
            wave_x_temp = -1 * (this.x - 1.0);
            this.samples = context.music.numsamples;
            for (i = 0; i < this.samples; i++) {
                this.wavearray[i * 2] = i / this.samples;
                this.wavearray[i * 2 + 1] = context.music.pcmdataR[i] * .04 * this.scale + wave_x_temp;
            }

        } else if (this.mode == WaveMode.DoubleLine) {

            wave_x_temp = -2 * 0.4142 * (Math.abs(Math.abs(this.mystery) - .5) - .5);
            this.rot = -this.mystery * 90;
            this.aspectScale = 1.0 + wave_x_temp;
            this.samples = context.music.numsamples;
            this.two_waves = true;
            var y_adj = this.y * this.y * .5;
            wave_y_temp = -1 * (this.x - 1);
            for (i = 0; i < this.samples; i++) {
                this.wavearray[i * 2] = i / this.samples;
                this.wavearray[i * 2 + 1] = context.music.pcmdataL[i] * .04 * this.scale + (wave_y_temp + y_adj);
            }
            for (i = 0; i < this.samples; i++) {
                this.wavearray2[i * 2] = i / this.samples;
                this.wavearray2[i * 2 + 1] = context.music.pcmdataR[i] * .04 * this.scale + (wave_y_temp - y_adj);
            }
        }
    }

    return MilkdropWaveform;
});