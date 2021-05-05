// Global state

const queueId : string = document.currentScript?.getAttribute('queueId') || 'undefined';
var currentVideoId: number;
var lastServerUpdate: QueueState;
var currentState: QueueState;
var lastServerUpdateTime: number;

type Video = { 'id': number, 'youtubeId': string, 'title': string, 'duration': number };
type QueueState = { 'id': string, 'videos': Video[], 'currentVideoTime': number, 'listeners': number };


function connectToQueue() {
    if (!!window.EventSource) {
        var connectedIcon = document.getElementById("connected-icon") as HTMLElement;
        var disconnectedIcon = document.getElementById("disconnected-icon") as HTMLElement;

        var source = new EventSource('/queue/' + queueId + "/state")

        source.addEventListener('message', function (e) {
            console.log("Received server event:", e)
            lastServerUpdate = JSON.parse(e.data) as QueueState;
            currentState = lastServerUpdate;
            // assert(queueId == lastServerUpdate.id);
            renderQueue();
        }, false)

        source.addEventListener('open', function (e) {
            connectedIcon.style.display = "inline";
            disconnectedIcon.style.display = "none";
            console.log("Connected to SSE source.")
        }, false)

        source.addEventListener('error', function (e) {
            console.log("EventSource error:", e);
            if (e.eventPhase == EventSource.CLOSED || source.readyState == EventSource.CLOSED) {
                source.close();
                connectedIcon.style.display = "none";
                disconnectedIcon.style.display = "inline";
                console.log("SSE source connection was closed, reconnecting in 3 seconds...")
                setTimeout(() => connectToQueue(), 3000);
            } else if (source.readyState == EventSource.CONNECTING) {
                console.log("SSE source is connecting...")
            }
        }, false)
    } else {
        console.log("Your browser does not support SSE.")
    }
}


function addToQueue() {
    if (queueId) {
        var input = document.getElementById("videoUrlInput") as HTMLInputElement;
        var videoUrl = input.value;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", '/queue/' + queueId + '/push', false);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(`{"query": "${videoUrl}"}`);
        if (xmlHttp.status != 200) {
            input.classList.add("invalid-input");
        } else {
            input.classList.remove("invalid-input");
        }
    }
}


function renderQueue() {

    var currentTime = currentState.currentVideoTime;
    var videoQueue = currentState.videos;

    (document.getElementById("listeners") as HTMLSpanElement).innerHTML = currentState.listeners.toString();

    if (!videoQueue.length) {
        console.log(`Queue ${queueId} is empty.`);
        var queue = document.getElementById("queue") as HTMLDivElement;
        queue.style.display = "none";
        player.stopVideo();
        return;
    }
    var newVideo = videoQueue[0];
    console.log("Updating queue from data", currentState);

    let offset: number = Infinity;

    if (currentVideoId == newVideo['id']) {
        offset = Math.abs(currentTime - player.getCurrentTime());
    } else if (videoQueue.length > 1 && currentVideoId == videoQueue[1].id) {
        // already playing next one
        offset = Math.abs(currentTime - videoQueue[0].duration) + player.getCurrentTime();
    }

    if (player.getPlayerState() in [YT.PlayerState.BUFFERING, YT.PlayerState.PLAYING] == false) {
        console.log(`Starting video ${newVideo['id']}.`);
        setCurrentVideo(newVideo['id'], newVideo['youtubeId'], currentTime);
    } else if (offset > 10) {
        console.log(`Updating time, off by ${offset}.`);
        setCurrentVideo(newVideo['id'], newVideo['youtubeId'], currentTime);
    }

    (document.getElementById("current-video-title") as HTMLDivElement).innerHTML = `
    <div class="input-group" style="display:table; width:100%;">
        <span class="video-title">
                ${newVideo['title']}
        </span>
        <button type="button" class="btn btn-outline-secondary video-remove-button" onclick=removeVideo(${newVideo['id']})>
            <i class="bi bi-skip-end-fill video-remove-icon"></i>
        </button>
    </div>
    `;
    let ul = document.getElementById("queued-videos-titles") as HTMLDivElement;
    ul.innerHTML = '';
    for (let i = 1; i < videoQueue.length; i++) {
        var raw = `
            <li class="list-group-item video-in-queue">
                <div class="input-group" style="display:table; width:100%;">
                    <span class="video-title">
                        ${videoQueue[i].title}
                    </span>
                    <button type="button" class="btn btn-outline-secondary video-remove-button" onclick=removeVideo(${videoQueue[i].id})>
                        <i class="bi bi-trash video-remove-icon"></i>
                    </button>
                </div>
            </li>`;
        var container = document.createElement("div");
        container.innerHTML = raw;
        ul?.appendChild(container);
    }

    var queue = document.getElementById("queue") as HTMLDivElement;
    queue.style.display = "block";
}

function removeVideo(id : number) {
    if (queueId) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("PUT", '/queue/' + queueId + '/remove-video/' + id, false);
        xmlHttp.send(null);
        // TODO: validate response
    }
}

function setCurrentVideo(id: number, youtubeId : string, startSeconds: number) {
    currentVideoId = id;
    player.loadVideoById(youtubeId, startSeconds, "large");
    player.seekTo(startSeconds, true);
    player.playVideo();
    // TODO: find a better solution for this. Maybe have a 'play' or 'connect' button
    // appear after the player is ready.
    setTimeout(() => {
        if (playerState == YT.PlayerState.UNSTARTED) {
            // Probably because autoplay is not enabled, try with the video muted
            player.mute();
            player.playVideo();
        }
    }, 1500);
}

function onVideoEnds() {
    console.log("Video ended, popping preemptively")
    currentState.currentVideoTime = 0;
    currentState.videos.shift();
    renderQueue();
}

var playerReady = false;
var siteLoaded = false;

function onPlayerReady() {
    playerReady = true;
    if(playerReady && siteLoaded) connectToQueue();
}

window.onload = () => {
    var input = document.getElementById('videoUrlInput') as HTMLInputElement;
    input.onkeydown = function(e){
        const code = e.key || e.code;
        if(e.key == 'Enter'){
            addToQueue();
        }
     };

    siteLoaded = true;
    if(playerReady && siteLoaded) connectToQueue();
}