function initStaticPlayer(config) {
  var video = document.getElementById(config.videoId);
  var trigger = document.querySelector(config.buttonSelector);
  var started = false;
  function begin() {
    if (!video || started) return;
    started = true;
    if (trigger) trigger.classList.add('is-hidden');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(config.url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        }
      });
    } else {
      video.src = config.url;
      video.play().catch(function() {});
    }
  }
  if (trigger) trigger.addEventListener('click', begin);
  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) begin();
    });
  }
}
