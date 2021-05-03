var player : YT.Player;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    playerVars: {
        'autoplay': 1,
        'controls': 1,
        'showinfo': 0
    },
    events: {
        'onReady': _onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

// 4. The API will call this function when the video player is ready.
function _onPlayerReady(event : any) {
    onPlayerReady();
}


function onPlayerStateChange(event : any) {
    if(event.data === 0) {
        onVideoEnds();
    }
}