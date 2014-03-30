// /*
//     @class = Player
//     @param config
//         swfUrl: the path to soundmanagers swfs files
//         clientId: your souncdloud clientId
// */
// function Player(config) {

//     this.clientId = config['clientId'];
    
//     this.initSoundCloudClient();

//     this.left = new Waveform({
//         container: document.getElementById("left"),
//         width: 400,
//         height: 100,
//         innerColor: "#333"
//     });
//     this.right = new Waveform({
//         container: document.getElementById("right"),
//         width: 400,
//         height: 100,
//         innerColor: "#333"
//     });
// }
// Player.prototype = {
//     /*
//         Initializes the sound manager
//         @opts
//             swfUrl: swfs path for soundmanager2
//     */

//     initSoundCloudClient: function() {
//         try {
//             SC.initialize({
//                 client_id: this.clientId
//             });
//         } catch (err) {
//             console.log("Failed to initalize soundcloud client");
//             throw (err);
//         }

//         var that = this;
//         SC.stream('/tracks/293', {
//             useWaveformData: true
//         }, function(audio) {
//             audio.load({

//                 whileplaying: function() {
//                     var left = this.waveformData.left;
//                     var right = this.waveformData.right;
//                     for (i = 0; i < 256; i++) {
//                         left[i] = parseFloat(left[i]);
//                         right[i] = parseFloat(right[i]);
//                     }
//                     that.left.update({
//                         data: left
//                     });
//                     that.right.update({
//                         data: right
//                     });
//                 }
//             });
//             audio.play();
//         });
//     },
// }