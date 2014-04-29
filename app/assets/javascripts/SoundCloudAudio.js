define("SoundCloudAudio",
    function() {

        function SoundCloudAudio(waveDataFunc, context) {
            this.clientId = '076fcc61717065186c152a88c3bb4f91';
            this.initSoundCloudClient();
            this.waveDataFunc = waveDataFunc;
            this.context = context;
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
                SC.stream('/tracks/293', {
                    useWaveformData: true
                }, function(audio) {
                    audio.load({

                        whileplaying: function() {
                            var left = this.waveformData.left;
                            var right = this.waveformData.right;
                            for (i = 0; i < 256; i++) {
                                left[i] = parseFloat(left[i]);
                                right[i] = parseFloat(right[i]);
                            }
                            that.waveDataFunc.call(that.context, left, right);
                        }
                    });
                    audio.play();
                });
            }

        }
        return SoundCloudAudio;
    }
);