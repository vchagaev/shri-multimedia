!function(e){function t(a){if(n[a])return n[a].exports;var i=n[a]={exports:{},id:a,loaded:!1};return e[a].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}function i(){window.KinoPlayer=new r["default"]("canvasOne","video/sherlock","audio/taper","subs/subs.srt")}var o=n(1),r=a(o);document.addEventListener("DOMContentLoaded",i)},function(e,t,n){"use strict";function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}(),o=n(2),r=function(){function e(t,n,i,r){var u=this;a(this,e),this.canvasSettings={id:t,firstCompositeOperation:"color",secondCompositeOperation:"multiply",fillStyle:"#FFFFFF",font:"44px Oranienbaum",buttonWait:5,bW:32,bH:32,playX:10,playY:678,pauseX:50,pauseY:678,stopX:90,stopY:678},this.audioSettings={src:i,loop:!0},this.videoSettings={src:n,loop:!1},this.subSettings={src:r,leftMargin:100,topMargin:320},this.oldVideoSettings={src:"video/oldfilm",loop:!0},this.controlsImgSettings={src:"imgs/videobuttons.png"},Promise.all([(0,o.loadVideo)(this.videoSettings),(0,o.loadVideo)(this.oldVideoSettings),(0,o.loadAudio)(this.audioSettings),(0,o.loadSubs)(this.subSettings),(0,o.loadImg)(this.controlsImgSettings)]).then(function(){u._initCanvas(u.canvasSettings),u._initMainVideo(u.videoSettings),u._runLoop()})}return i(e,[{key:"_runLoop",value:function(){var e=this;this._drawScreen(),requestAnimationFrame(function(){e._runLoop()})}},{key:"_drawScreen",value:function(){var e=this.canvasSettings.context,t=this.videoSettings,n=this.subSettings,a=this.canvasSettings,i=this.controlsImgSettings;t.subPause?(0,o.fillTextMultiLine)(e,n.curSubText,n.leftMargin,n.topMargin):e.drawImage(this.videoSettings.elem,0,0);var r=e.globalCompositeOperation;e.globalCompositeOperation=a.firstCompositeOperation,e.fillStyle=a.fillStyle,e.fillRect(0,0,a.canvas.width,a.canvas.height),e.globalCompositeOperation=a.secondCompositeOperation,e.drawImage(this.oldVideoSettings.elem,0,0),e.globalCompositeOperation=r,!t.elem.paused||t.subPause&&!t.forcePause?e.drawImage(i.elem,0,32,a.bW,a.bH,a.playX,a.playY,a.bW,a.bH):e.drawImage(i.elem,0,0,a.bW,a.bH,a.playX,a.playY,a.bW,a.bH),t.elem.paused&&!t.subPause||t.forcePause?e.drawImage(i.elem,32,32,a.bW,a.bH,a.pauseX,a.pauseY,a.bW,a.bH):e.drawImage(i.elem,32,0,a.bW,a.bH,a.pauseX,a.pauseY,a.bW,a.bH),e.drawImage(i.elem,64,0,a.bW,a.bH,a.stopX,a.stopY,a.bW,a.bH),a.timeWaited++}},{key:"_initMainVideo",value:function(e){function t(){n.forcePause?setTimeout(t,1e3):(n.subPause=!1,n.elem.play(),a.curSubNum++,a.curSubNum>=a.subArray.length&&(a.curSubNum=void 0))}var n=this.videoSettings,a=this.subSettings,i=this.oldVideoSettings,o=this.audioSettings;e.elem.addEventListener("timeupdate",function(){void 0!==a.curSubNum&&1e3*n.elem.currentTime>=a.subArray[a.curSubNum].endTime&&!n.subPause&&(n.subPause=!0,n.elem.pause(),a.curSubText=a.subArray[a.curSubNum].text,setTimeout(t,a.subArray[a.curSubNum].endTime-a.subArray[a.curSubNum].startTime))},!1),e.elem.addEventListener("ended",function(){i.elem.pause(),n.elem.pause(),o.elem.pause(),o.elem.currentTime=0,n.elem.currentTime=0,n.subPause=!1,a.curSubNum=0,n.forcePause=!1},!1)}},{key:"_initCanvas",value:function(e){function t(t){if(e.timeWaited>=e.buttonWait){e.timeWaited=0;var r=void 0,u=void 0;(t.pageX||t.pageY)&&(r=t.pageX,u=t.pageY),r-=e.canvas.offsetLeft,u-=e.canvas.offsetTop;var s=r,l=u;l>=e.playY&&l<=e.playY+e.bH&&s>=e.playX&&s<=e.playX+e.bW&&n.elem.paused&&(n.elem.play(),i.elem.play(),a.elem.play(),n.forcePause=!1),l>=e.stopY&&l<=e.stopY+e.bH&&s>=e.stopX&&s<=e.stopX+e.bW&&(i.elem.pause(),n.elem.pause(),a.elem.pause(),a.elem.currentTime=0,n.elem.currentTime=0,n.subPause=!1,o.curSubNum=0,n.forcePause=!1),l>=e.pauseY&&l<=e.pauseY+e.bH&&s>=e.pauseX&&s<=e.pauseX+e.bW&&(n.forcePause=!0,!n.elem.paused||n.subPause?(n.elem.pause(),i.elem.pause(),a.elem.pause()):(n.elem.play(),i.elem.play(),a.elem.play(),n.forcePause=!1))}}e.canvas=document.getElementById(e.id),e.context=e.canvas.getContext("2d"),e.context.font=e.font,e.timeWaited=e.buttonWait;var n=this.videoSettings,a=this.audioSettings,i=this.oldVideoSettings,o=this.subSettings;e.canvas.addEventListener("mouseup",t,!1)}}]),e}();t["default"]=r},function(e,t,n){"use strict";function a(e){return e&&e.__esModule?e:{"default":e}}function i(e){var t="";return"probably"===e.canPlayType("video/webm")||"maybe"===e.canPlayType("video/webm")?t="webm":"probably"===e.canPlayType("video/mp4")||"maybe"===e.canPlayType("video/mp4")?t="mp4":"probably"!==e.canPlayType("video/ogg")&&"maybe"!==e.canPlayType("video/ogg")||(t="ogg"),t}function o(e){var t="";return"probably"===e.canPlayType("audio/ogg")||"maybe"===e.canPlayType("audio/ogg")?t="ogg":"probably"===e.canPlayType("audio/wav")||"maybe"===e.canPlayType("audio/wav")?t="wav":"probably"!==e.canPlayType("audio/mp3")&&"maybe"!==e.canPlayType("audio/mp3")||(t="mp3"),t}function r(e,t,n,a){for(var i=1.5*e.measureText("M").width,o=t.split("\n"),r=0;r<o.length;++r)e.fillText(o[r],n,a),a+=i}function u(e){return new Promise(function(t,n){e.elem=document.createElement("video"),e.wrapper=document.createElement("div"),document.body.appendChild(e.wrapper),e.wrapper.appendChild(e.elem),e.wrapper.setAttribute("style","display:none;"),e.elem.loop=e.loop,e.elem.muted=!0,e.ext="."+i(e.elem),"."===e.ext&&n(),e.elem.addEventListener("canplay",function(){t()},!1),e.elem.setAttribute("src",e.src+e.ext)})}function s(e){return new Promise(function(t,n){e.elem=document.createElement("audio"),e.elem.loop=e.loop,document.body.appendChild(e.elem),e.ext="."+o(e.elem),"."===e.ext&&n(),e.elem.addEventListener("canplaythrough",function(){t()},!1),e.elem.setAttribute("src",e.src+e.ext)})}function l(e){return new Promise(function(t,n){fetch(e.src).then(function(n){n.text().then(function(n){e.subArray=c["default"].fromSrt(n,!0),e.curSubNum=0,e.curSubText=e.subArray[e.curSubNum],t()})})["catch"](n)})}function m(e){return new Promise(function(t){e.elem=new Image,e.elem.addEventListener("load",function(){t()},!1),e.elem.src=e.src})}Object.defineProperty(t,"__esModule",{value:!0}),t.fillTextMultiLine=r,t.loadVideo=u,t.loadAudio=s,t.loadSubs=l,t.loadImg=m;var d=n(3),c=a(d)},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},i=t.parser=function(){var e={};e.fromSrt=function(e,n){var a=!!n;e=e.replace(/\r/g,"");var i=/(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;e=e.split(i),e.shift();for(var o=[],r=0;r<e.length;r+=4)o.push({id:e[r].trim(),startTime:a?t(e[r+1].trim()):e[r+1].trim(),endTime:a?t(e[r+2].trim()):e[r+2].trim(),text:e[r+3].trim()});return o},e.toSrt=function(e){if(!e instanceof Array)return"";for(var t="",a=0;a<e.length;a++){var i=e[a];isNaN(i.startTime)||isNaN(i.endTime)||(i.startTime=n(parseInt(i.startTime,10)),i.endTime=n(parseInt(i.endTime,10))),t+=i.id+"\r\n",t+=i.startTime+" --> "+i.endTime+"\r\n",t+=i.text.replace("\n","\r\n")+"\r\n\r\n"}return t};var t=function(e){var t=/(\d+):(\d{2}):(\d{2}),(\d{3})/,n=t.exec(e);if(null===n)return 0;for(var a=1;a<5;a++)n[a]=parseInt(n[a],10),isNaN(n[a])&&(n[a]=0);return 36e5*n[1]+6e4*n[2]+1e3*n[3]+n[4]},n=function(e){var t=[36e5,6e4,1e3],n=[];for(var a in t){var i=(e/t[a]>>0).toString();i.length<2&&(i="0"+i),e%=t[a],n.push(i)}var o=e.toString();if(o.length<3)for(a=0;a<=3-o.length;a++)o="0"+o;return n.join(":")+","+o};return e}();"object"===a(t)&&(e.exports=i)}]);
//# sourceMappingURL=app.bundle.js.map