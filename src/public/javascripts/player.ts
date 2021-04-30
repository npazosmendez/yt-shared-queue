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
    height: '320',
    width: '640',
    videoId: '',
    playerVars: {
        'autoplay': 1,
        'controls': 0,
        'showinfo': 0
    },
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event : any) {
    event.target.playVideo();
}


function onPlayerStateChange(event : any) {
    if(event.data === 0) {
        onVideoEnds();
    }
}