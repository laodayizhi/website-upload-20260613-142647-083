import { H as Hls } from './video-vendor-dru42stk.js';

var video = document.getElementById('movie-video');
var startButton = document.querySelector('[data-player-start]');
var message = document.querySelector('[data-player-message]');
var playerCard = document.querySelector('.player-card');
var hls = null;
var initialized = false;

function setMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

function initializePlayer() {
  if (!video || initialized) {
    return Promise.resolve();
  }

  initialized = true;
  var source = video.dataset.src;

  if (!source) {
    setMessage('未找到播放源');
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage('播放源已加载，可开始观看');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setMessage('播放源加载异常，请刷新页面重试');
        if (hls) {
          hls.destroy();
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setMessage('播放源已加载，可开始观看');
  } else {
    setMessage('当前浏览器不支持 HLS 播放');
  }

  return Promise.resolve();
}

function playVideo() {
  initializePlayer().then(function () {
    if (!video) {
      return;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('浏览器阻止了自动播放，请再次点击播放按钮');
      });
    }
  });
}

if (startButton) {
  startButton.addEventListener('click', playVideo);
}

if (video) {
  video.addEventListener('play', function () {
    if (playerCard) {
      playerCard.classList.add('is-playing');
    }
    setMessage('正在播放');
  });

  video.addEventListener('pause', function () {
    if (playerCard) {
      playerCard.classList.remove('is-playing');
    }
  });

  video.addEventListener('error', function () {
    setMessage('视频播放失败，请检查网络或播放源');
  });
}

window.addEventListener('beforeunload', function () {
  if (hls) {
    hls.destroy();
  }
});
