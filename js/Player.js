document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

function onDOMContentLoaded() {
    window.KinoPlayer = new KinoPlayer('canvasOne', 'video/sherlock', 'audio/taper', 'subs/subs.srt');
}

class KinoPlayer {
    constructor(canvasId, videoSrc, audioSrc, subSrc) {
        this.canvasSettings = {
            id: canvasId,
            firstCompositeOperation: 'color',
            secondCompositeOperation: 'multiply',
            fillStyle: '#FFFFFF'
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
            this._loadVideo(this.videoSettings),
            this._loadVideo(this.oldVideoSettings),
            this._loadAudio(this.audioSettings),
            this._loadSubs(this.subSettings),
            this._loadImg(this.controlsImgSettings)
        ]).then(() => {
            this._initCanvas(this.canvasSettings);
            this._initMainVideo(this.videoSettings);
            this._runLoop();
        });
    }

    _runLoop() {
        this._drawScreen();
        requestAnimationFrame(() => {
            this._runLoop();
        });
    }

    _drawScreen() {
        const context = this.canvasSettings.context;
        const videoSettings = this.videoSettings;
        const subSettings = this.subSettings;
        const canvasSettings = this.canvasSettings;
        const imgSettings = this.controlsImgSettings;
        if (!videoSettings.subPause) {
            context.drawImage(this.videoSettings.elem, 0, 0);
        } else {
            KinoPlayer._fillTextMultiLine(context, subSettings.curSubText, subSettings.leftMargin, subSettings.topMargin);
        }
        const oldOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = canvasSettings.firstCompositeOperation;
        context.fillStyle = canvasSettings.fillStyle;
        context.fillRect(0, 0, canvasSettings.canvas.width, canvasSettings.canvas.height);
        context.globalCompositeOperation = canvasSettings.secondCompositeOperation;
        context.drawImage(this.oldVideoSettings.elem, 0, 0);
        context.globalCompositeOperation = oldOperation;
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

    _loadVideo(settings) {
        return new Promise((resolve, reject) => {
            settings.elem = document.createElement('video');
            settings.wrapper = document.createElement('div');
            document.body.appendChild(settings.wrapper);
            settings.wrapper.appendChild(settings.elem);
            settings.wrapper.setAttribute('style', 'display:none;');
            settings.elem.loop = settings.loop;
            settings.elem.muted = true;
            settings.ext = '.' + KinoPlayer._supportedVideoFormat(settings.elem);
            if (settings.ext === '.') {
                reject();
            }
            settings.elem.addEventListener('canplay', () => {
                resolve();
            }, false);
            settings.elem.setAttribute('src', settings.src + settings.ext);
        });
    }

    _loadAudio(settings) {
        return new Promise((resolve, reject) => {
            settings.elem = document.createElement('audio');
            settings.elem.loop = settings.loop;
            document.body.appendChild(settings.elem);
            settings.ext = '.' + KinoPlayer._supportedAudioFormat(settings.elem);
            if (settings.ext === '.') {
                reject();
            }
            settings.elem.addEventListener('canplaythrough', () => {
                resolve();
            }, false);
            settings.elem.setAttribute('src', settings.src + settings.ext);
        });
    }

    _loadSubs(settings) {
        return new Promise((resolve, reject) => {
            fetch(settings.src)
                .then((response) => {
                    response.text().then((rawSrt) => {
                        settings.subArray = parser.fromSrt(rawSrt, true);
                        settings.curSubNum = 0;
                        settings.curSubText = settings.subArray[settings.curSubNum];
                        resolve();
                    });
                })
                .catch(reject);
        });
    }

    _loadImg(settings) {
        return new Promise((resolve, reject) => {
            settings.elem = new Image();
            settings.elem.addEventListener('load', () => {
                resolve();
            }, false);
            settings.elem.src = settings.src;
        });
    }

    _initMainVideo(settings) {
        const videoSettings = this.videoSettings;
        const subSettings = this.subSettings;
        const oldVideoSettings = this.oldVideoSettings;
        const audioSettings = this.audioSettings;

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

    _initCanvas(settings) {
        settings.canvas = document.getElementById(settings.id);
        settings.context = settings.canvas.getContext('2d');
        settings.context.font = '44px Oranienbaum';
        settings.buttonWait = 5;
        settings.timeWaited = settings.buttonWait;
        settings.bW = 32;
        settings.bH = 32;
        settings.playX = 10;
        settings.playY = 678;
        settings.pauseX = 50;
        settings.pauseY = 678;
        settings.stopX = 90;
        settings.stopY = 678;
        const videoSettings = this.videoSettings;
        const audioSettings = this.audioSettings;
        const oldVideoSettings = this.oldVideoSettings;
        const subSettings = this.subSettings;
        settings.canvas.addEventListener('mouseup', eventMouseUp, false);

        function eventMouseUp(event) {
            if (settings.timeWaited >= settings.buttonWait) {
                settings.timeWaited = 0;

                let x;
                let y;
                if (event.pageX || event.pageY) {
                    x = event.pageX;
                    y = event.pageY;
                } else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
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

    static _supportedVideoFormat(video) {
        let returnExtension = '';
        if (video.canPlayType('video/webm') === 'probably' ||
            video.canPlayType('video/webm') === 'maybe') {
            returnExtension = 'webm';
        } else if (video.canPlayType('video/mp4') === 'probably' ||
            video.canPlayType('video/mp4') === 'maybe') {
            returnExtension = 'mp4';
        } else if (video.canPlayType('video/ogg') === 'probably' ||
            video.canPlayType('video/ogg') === 'maybe') {
            returnExtension = 'ogg';
        }
        return returnExtension;
    }

    static _supportedAudioFormat(audio) {
        let returnExtension = '';
        if (audio.canPlayType('audio/ogg') === 'probably' ||
            audio.canPlayType('audio/ogg') === 'maybe') {
            returnExtension = 'ogg';
        } else if (audio.canPlayType('audio/wav') === 'probably' ||
            audio.canPlayType('audio/wav') === 'maybe') {
            returnExtension = 'wav';
        } else if (audio.canPlayType('audio/mp3') === 'probably' ||
            audio.canPlayType('audio/mp3') === 'maybe') {
            returnExtension = 'mp3';
        }
        return returnExtension;
    }

    static _fillTextMultiLine(ctx, text, x, y) {
        const lineHeight = ctx.measureText('M').width * 1.5;
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; ++i) {
            ctx.fillText(lines[i], x, y);
            y += lineHeight;
        }
    }

}
