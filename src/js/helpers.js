import parser from './parser';

/**
 * Get supported video format
 * @param {object} video - DOM video element
 * @returns {string} supported video format
 */
function supportedVideoFormat(video) {
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

/**
 * Get supported audio format
 * @param {object} audio - DOM audio element
 * @returns {string} supported audio format
 */
function supportedAudioFormat(audio) {
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

/**
 * Fill canvas with multiline text
 * @param {object} ctx - canvas context
 * @param {string} text - text to fill
 * @param {Number} x - margin left
 * @param {Number} y - margin top
 */
export function fillTextMultiLine(ctx, text, x, y) {
    const lineHeight = ctx.measureText('M').width * 1.5;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; ++i) {
        ctx.fillText(lines[i], x, y);
        y += lineHeight;
    }
}

/**
 * Load and hide video DOM elem
 * @param {object} settings - video settings
 * @returns {Promise} - resolve when done
 */
export function loadVideo(settings) {
    return new Promise((resolve, reject) => {
        settings.elem = document.createElement('video');
        settings.wrapper = document.createElement('div');
        document.body.appendChild(settings.wrapper);
        settings.wrapper.appendChild(settings.elem);
        settings.wrapper.setAttribute('style', 'display:none;');
        settings.elem.loop = settings.loop;
        settings.elem.muted = true;
        settings.ext = '.' + supportedVideoFormat(settings.elem);
        if (settings.ext === '.') {
            reject();
        }
        settings.elem.addEventListener('canplay', () => {
            resolve();
        }, false);
        settings.elem.setAttribute('src', settings.src + settings.ext);
    });
}

/**
 * Load and hide audio DOM elem
 * @param {object} settings - audio settings
 * @returns {Promise} - resolve when done
 */
export function loadAudio(settings) {
    return new Promise((resolve, reject) => {
        settings.elem = document.createElement('audio');
        settings.elem.loop = settings.loop;
        document.body.appendChild(settings.elem);
        settings.ext = '.' + supportedAudioFormat(settings.elem);
        if (settings.ext === '.') {
            reject();
        }
        settings.elem.addEventListener('canplaythrough', () => {
            resolve();
        }, false);
        settings.elem.setAttribute('src', settings.src + settings.ext);
    });
}

/**
 * Load and parse srt subtitles
 * @param {object} settings - subtitles settings
 * @returns {Promise} - resolve when done
 */
export function loadSubs(settings) {
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

/**
 * Load image
 * @param {object} settings - image settings
 * @returns {Promise} - resolve when done
 */
export function loadImg(settings) {
    return new Promise((resolve) => {
        settings.elem = new Image();
        settings.elem.addEventListener('load', () => {
            resolve();
        }, false);
        settings.elem.src = settings.src;
    });
}
