// Global state
var queueId: string;
var currentVideoId: number;
var lastServerUpdate: QueueState;
var currentState: QueueState;
var lastServerUpdateTime: number;

type Video = { 'id': number, 'youtubeId': string, 'title': string, 'duration': number };
type QueueState = { 'id': string, 'videos': Video[], 'currentVideoTime': number };

function newQueue() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("PUT", '/queue', false);
    xmlHttp.send(null);

    // TODO: validate
    var data = JSON.parse(xmlHttp.responseText);
    queueId = data.id;

    if (queueId) {
        document.getElementById("queueIdInput")?.setAttribute("value", queueId);
        connectToQueue();
    } else {
        let f = document.getElementById("queueIdInput") as HTMLInputElement;
        f.value = "ERROR!";
    }
}

function connectToQueue() {
    queueId = (document.getElementById("queueIdInput") as HTMLInputElement).value;

    document.getElementById("queueIdInput")?.setAttribute("value", queueId);

    if (!!window.EventSource) {
        var source = new EventSource('/queue/' + queueId + "/state")

        source.addEventListener('message', function (e) {
            console.log("Received server event:", e)
            lastServerUpdate = JSON.parse(e.data) as QueueState;
            currentState = lastServerUpdate;
            queueId = lastServerUpdate.id;
            renderQueue();
        }, false)

        source.addEventListener('open', function (e) {
            console.log("Connected to event source")
        }, false)

        source.addEventListener('error', function (e) {
            console.log("EventSource error:", e);
            if (e.eventPhase == EventSource.CLOSED){
                source.close();
            }

            if (source.readyState == EventSource.CLOSED) {
                // TODO
            }
            else if (source.readyState == EventSource.CONNECTING) {
                // TODO
            }
        }, false)
    } else {
        console.log("Your browser does not support SSE")
    }
}


function addToQueue() {
    if (queueId) {
        var videoUrl = (document.getElementById("videoUrlInput") as HTMLInputElement).value;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", '/queue/' + queueId + '/push', false);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(`{"url": "${videoUrl}"}`);
    }
}

function renderQueue() {
    var currentQueue = document.getElementById("current-queue") as HTMLInputElement;
    if (!queueId) {
        currentQueue.style.display = "none";
        return;
    } else {
        currentQueue.style.display = "block";
    }

    (document.getElementById("queue-name") as HTMLDivElement).innerHTML = "Queue " + queueId;

    var currentTime = currentState.currentVideoTime;
    var videoQueue = currentState.videos;

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

    (document.getElementById("current-video-title") as HTMLDivElement).innerHTML = newVideo['title'];
    let ul = document.getElementById("queued-videos-titles") as HTMLDivElement;
    ul.innerHTML = '';
    for (let i = 1; i < videoQueue.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = videoQueue[i].title;
        li.classList.add("list-group-item");
        ul?.appendChild(li);
    }

    var queue = document.getElementById("queue") as HTMLDivElement;
    queue.style.display = "block";
}

function setCurrentVideo(id: number, youtubeId : string, startSeconds: number) {
    currentVideoId = id;
    player.loadVideoById(youtubeId, startSeconds, "large");
    player.playVideo();
}

function onVideoEnds() {
    console.log("Video ended, popping preemptively")
    currentState.currentVideoTime = 0;
    currentState.videos.shift();
    renderQueue();
}
