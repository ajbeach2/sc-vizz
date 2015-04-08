define("SoundCloudAudio",
    function() {

        function SoundCloudAudio(waveDataFunc, context) {
            this.clientId = '076fcc61717065186c152a88c3bb4f91';
            this.initSoundCloudClient();
            this.waveDataFunc = waveDataFunc;
            this.context = context;

            this.progress = document.getElementById('player-progress-playing');
            this.loading = document.getElementById('player-progress-loading');
        }

        SoundCloudAudio.prototype = {
            initSoundCloudClient: function() {
                try {
                    SC.initialize({
                        client_id: this.clientId
                    });
                } catch (err) {
                    console.log("Failed to initalize soundcloud client");
                    throw (err);
                }

                var that = this;
                SC.stream('/tracks/91801862', {
                    useWaveformData: true
                }, function(audio) {
                    audio.load({

                        whileloading: function() {
                            var percent = (((this.bytesLoaded / this.bytesTotal) * 10000) | 0) / 100;
                            that.loading.style.width = percent + "%";
                        },

                        whileplaying: function() {
                            var left = this.waveformData.left;
                            var right = this.waveformData.right;
                            for (i = 0; i < 256; i++) {
                                left[i] = parseFloat(left[i]);
                                right[i] = parseFloat(right[i]);
                            }
                            that.waveDataFunc.call(that.context, left, right);
                            var percent = (((this.position / this.durationEstimate) * 10000) | 0) / 100;
                            that.progress.style.width = percent + "%";

                        }
                    });


                    audio.play();
                });
            }

        }
        return SoundCloudAudio;
    }
);