(function () {
  function setupPlayer(source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    var button = document.getElementById("player-toggle");
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
      attached = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }

    function startPlayback() {
      attach();
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
