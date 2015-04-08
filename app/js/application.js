// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//

/**
 * milkshake -- WebGL Milkdrop-esque visualisation (port of projectM)
 * Copyright (C)2011 Matt Gattis and contributors
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * See 'LICENSE.txt' included within this release
 *
 */


window.onload = function() {
    require([
        "Shaker",
        "SoundCloudAudio",
        "Milk"
    ], function(Shaker, SoundCloudAudio, Milk) {


        var milk = Milk.getInstance();
        var canvas = milk.canvas;

        var shaker;
        var audio;

        function shake(elementId) {
            try {
                milk.initGL(function() {
                    shaker = new Shaker();
                    audio = new SoundCloudAudio(shaker.music.addPCM, shaker.music);
                    animationLoop();
                    setInterval(function() {
                        shaker.selectNext(true);
                    }, 10000);
                });
            } catch (e) {
                console.log(e.stack);
            }

        }
        var requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
                function(callback, element) {
                    window.setTimeout(callback, 1000 / 60);
            };

        function animationLoop() {
            shaker.renderFrame.call(shaker);
            requestAnimFrame(animationLoop, canvas);
        }
        shake('canvas');
    });
};