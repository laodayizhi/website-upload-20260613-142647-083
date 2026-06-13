(function () {
    function initMoviePlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        if (!video) {
            return;
        }
        var streamUrl = video.getAttribute("src") || video.currentSrc;
        var prepared = false;
        var hlsInstance = null;

        function prepareVideo() {
            if (prepared || !streamUrl) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                video.removeAttribute("src");
                video.load();
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            prepareVideo();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
    document.addEventListener("DOMContentLoaded", initMoviePlayer);
})();
