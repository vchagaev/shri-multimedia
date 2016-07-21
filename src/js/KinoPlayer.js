import {
    fillTextMultiLine,
    loadVideo,
    loadAudio,
    loadSubs,
    loadImg
} from './helpers';

/**
 * KinoPlayer is canvas video player with adding old movie effects.
 */
export default class KinoPlayer {
    /**
     * Create a KinoPlayer instance
     * @param {string} canvasId - canvas element id
     * @param {string} videoSrc - url to video without extension
     * @param {string} audioSrc - url to audio without extension
     * @param {string} subSrc - url to srt subtitles
     */
    constructor(canvasId, videoSrc, audioSrc, subSrc) {
        this.canvasSettings = {
            id: canvasId,
            firstCompositeOperation: 'color',
            secondCompositeOperation: 'multiply',
            fillStyle: '#FFFFFF',
            font: '44px Oranienbaum',
            buttonWait: 5,
            bW: 32, // control button width
            bH: 32, // control button height
            playX: 10, // offset x for play button
            playY: 678, // offset y for play button
            pauseX: 50, // offset x for pause button
            pauseY: 678, // offset x for pause button
            stopX: 90, // offset x for stop button
            stopY: 678 // offset x for stop button
        };
        this.audioSettings = {
            src: audioSrc,
            loop: true
        };
        this.videoSettings = {
            src: videoSrc,
            loop: false
        };
        this.subSettings = {
            src: subSrc,
            leftMargin: 100,
            topMargin: 320
        };
        this.oldVideoSettings = {
            src: 'video/oldfilm',
            loop: true
        };
        this.controlsImgSettings = {
            src: 'imgs/videobuttons.png'
        };
        Promise.all([
            loadVideo(this.videoSettings),
            loadVideo(this.oldVideoSettings),
            loadAudio(this.audioSettings),
            loadSubs(this.subSettings),
            loadImg(this.controlsImgSettings)
        ]).then(() => {
            this._initCanvas(this.canvasSettings);
            this._initMainVideo(this.videoSettings);
            this._runLoop();
        });
    }

    /**
     * Run game loop with request animation frame
     * @private
     */
    _runLoop() {
        this._drawScreen();
        requestAnimationFrame(() => {
            this._runLoop();
        });
    }

    /**
     * Draw combined canvas image
     * @private
     */
    _drawScreen() {
        const context = this.canvasSettings.context;
        const videoSettings = this.videoSettings;
        const subSettings = this.subSettings;
        const canvasSettings = this.canvasSettings;
        const imgSettings = this.controlsImgSettings;

        // Video or subtitles
        if (!videoSettings.subPause) {
            context.drawImage(this.videoSettings.elem, 0, 0);
        } else {
            fillTextMultiLine(context, subSettings.curSubText, subSettings.leftMargin, subSettings.topMargin);
        }

        // Use Composite operation for effects
        const oldOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = canvasSettings.firstCompositeOperation;
        context.fillStyle = canvasSettings.fillStyle;
        context.fillRect(0, 0, canvasSettings.canvas.width, canvasSettings.canvas.height);
        context.globalCompositeOperation = canvasSettings.secondCompositeOperation;
        context.drawImage(this.oldVideoSettings.elem, 0, 0);
        context.globalCompositeOperation = oldOperation;

        // Draw buttons depending on video status
        if (!videoSettings.elem.paused || (videoSettings.subPause && !videoSettings.forcePause)) {
            context.drawImage(imgSettings.elem, 0, 32, canvasSettings.bW, canvasSettings.bH, canvasSettings.playX,
                canvasSettings.playY, canvasSettings.bW, canvasSettings.bH); //Play Down

        } else {
            context.drawImage(imgSettings.elem, 0, 0, canvasSettings.bW, canvasSettings.bH, canvasSettings.playX,
                canvasSettings.playY, canvasSettings.bW, canvasSettings.bH); //Play up
        }

        if (videoSettings.elem.paused && !videoSettings.subPause || videoSettings.forcePause) {
            context.drawImage(imgSettings.elem,
                32, 32, canvasSettings.bW, canvasSettings.bH, canvasSettings.pauseX, canvasSettings.pauseY,
                canvasSettings.bW, canvasSettings.bH); // Pause down
        } else {
            context.drawImage(imgSettings.elem, 32, 0, canvasSettings.bW, canvasSettings.bH, canvasSettings.pauseX,
                canvasSettings.pauseY, canvasSettings.bW, canvasSettings.bH); // Pause up
        }

        context.drawImage(imgSettings.elem, 64, 0, canvasSettings.bW, canvasSettings.bH, canvasSettings.stopX,
            canvasSettings.stopY, canvasSettings.bW, canvasSettings.bH); // Stop up

        canvasSettings.timeWaited++;
    }

    /**
     * Extra initializing for main. Working with subtitles. Adding events.
     * @param {Object} settings - main video settings
     * @private
     */
    _initMainVideo(settings) {
        const videoSettings = this.videoSettings;
        const subSettings = this.subSettings;
        const oldVideoSettings = this.oldVideoSettings;
        const audioSettings = this.audioSettings;

        /**
         * Play again after showing subtitles or wait if video was paused
         */
        function afterSubs() {
            if (videoSettings.forcePause) {
                setTimeout(afterSubs, 1000);
            } else {
                videoSettings.subPause = false;
                videoSettings.elem.play();
                subSettings.curSubNum++;
                if (subSettings.curSubNum >= subSettings.subArray.length) {
                    subSettings.curSubNum = undefined;
                }
            }
        }

        /**
         * Check if it is time to show subtitles
         */
        settings.elem.addEventListener('timeupdate', () => {
            if (subSettings.curSubNum !== undefined &&
                videoSettings.elem.currentTime * 1000 >= subSettings.subArray[subSettings.curSubNum].endTime && !videoSettings.subPause) {
                videoSettings.subPause = true;
                videoSettings.elem.pause();
                subSettings.curSubText = subSettings.subArray[subSettings.curSubNum].text;
                setTimeout(afterSubs,
                    subSettings.subArray[subSettings.curSubNum].endTime - subSettings.subArray[subSettings.curSubNum].startTime);
            }
        }, false);

        /**
         * Reset all elements when main video is ended
         */
        settings.elem.addEventListener('ended', () => {
            oldVideoSettings.elem.pause();
            videoSettings.elem.pause();
            audioSettings.elem.pause();
            audioSettings.elem.currentTime = 0;
            videoSettings.elem.currentTime = 0;
            videoSettings.subPause = false;
            subSettings.curSubNum = 0;
            videoSettings.forcePause = false;
        }, false);
    }

    /**
     * Canvas initializing. Adding events to video player controls.
     * @param {object} settings - Canvas Settings
     * @private
     */
    _initCanvas(settings) {
        settings.canvas = document.getElementById(settings.id);
        settings.context = settings.canvas.getContext('2d');
        settings.context.font = settings.font;
        settings.timeWaited = settings.buttonWait;

        const videoSettings = this.videoSettings;
        const audioSettings = this.audioSettings;
        const oldVideoSettings = this.oldVideoSettings;
        const subSettings = this.subSettings;
        settings.canvas.addEventListener('mouseup', eventMouseUp, false);

        /**
         * Control which button is clicked
         * @param event
         */
        function eventMouseUp(event) {
            if (settings.timeWaited >= settings.buttonWait) {
                settings.timeWaited = 0;

                let x;
                let y;
                if (event.pageX || event.pageY) {
                    x = event.pageX;
                    y = event.pageY;
                }
                x -= settings.canvas.offsetLeft;
                y -= settings.canvas.offsetTop;

                const mouseX = x;
                const mouseY = y;

                //Hit Play
                if ((mouseY >= settings.playY) && (mouseY <= settings.playY + settings.bH) &&
                    (mouseX >= settings.playX) && (mouseX <= settings.playX + settings.bW)) {
                    if (videoSettings.elem.paused) {
                        videoSettings.elem.play();
                        oldVideoSettings.elem.play();
                        audioSettings.elem.play();
                        videoSettings.forcePause = false;
                    }
                }

                //Hit Stop
                if ((mouseY >= settings.stopY) && (mouseY <= settings.stopY + settings.bH) &&
                    (mouseX >= settings.stopX) && (mouseX <= settings.stopX + settings.bW)) {
                    oldVideoSettings.elem.pause();
                    videoSettings.elem.pause();
                    audioSettings.elem.pause();
                    audioSettings.elem.currentTime = 0;
                    videoSettings.elem.currentTime = 0;
                    videoSettings.subPause = false;
                    subSettings.curSubNum = 0;
                    videoSettings.forcePause = false;
                }

                //Hit Pause
                if ((mouseY >= settings.pauseY) && (mouseY <= settings.pauseY + settings.bH) &&
                    (mouseX >= settings.pauseX) && (mouseX <= settings.pauseX + settings.bW)) {
                    videoSettings.forcePause = true;
                    if (!videoSettings.elem.paused || videoSettings.subPause) {
                        videoSettings.elem.pause();
                        oldVideoSettings.elem.pause();
                        audioSettings.elem.pause();
                    } else {
                        videoSettings.elem.play();
                        oldVideoSettings.elem.play();
                        audioSettings.elem.play();
                        videoSettings.forcePause = false;
                    }
                }
            }
        }
    }
}
