var player : YT.Player;
var playerState : YT.PlayerState;

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
tag.setAttribute("allow", "autoplay");
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

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


function _onPlayerReady(event : any) {
    onPlayerReady();
}

function onPlayerStateChange(event : any) {
    playerState = event.data;
    if(event.data === 0) {
        onVideoEnds();
    }
}