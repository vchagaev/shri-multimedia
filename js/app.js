import KinoPlayer from './KinoPlayer';

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

function onDOMContentLoaded() {
    window.KinoPlayer = new KinoPlayer('canvasOne', 'video/sherlock', 'audio/taper', 'subs/subs.srt');
}
