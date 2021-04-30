// Global state
var queueId: string;
var currentVideoId: string;
var lastServerUpdate : ServerUpdate;
var lastServerUpdateTime : number;

type Video = { 'id': string, 'title': string, 'duration' : number };
type ServerUpdate = { 'id': string, 'videos': Video[], 'currentVideoTime': number};

function newQueue() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("PUT", '/queue', false);
    xmlHttp.send(null);

    var data = JSON.parse(xmlHttp.responseText);
    queueId = data.id;

    if (queueId) {
        document.getElementById("queueIdInput")?.setAttribute("value", queueId);
    } else {
        let f = document.getElementById("queueIdInput") as HTMLInputElement;
        f.value = "ERROR!";
    }
    updateQueueData();

}

function connectToQueue() {
    // TODO: validate
    queueId = (document.getElementById("queueIdInput") as HTMLInputElement).value;
    updateQueueData();
}

function addToQueue() {
    if (queueId) {
        var videoUrl = (document.getElementById("videoUrlInput") as HTMLInputElement).value;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", '/queue/' + queueId + '/push', false);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(`{"url": "${videoUrl}"}`);
    }

    updateQueueData();
}

function updateQueueData() {
    if (!queueId) {
        console.log("No queue to update.")
        return;
    }
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/queue/' + queueId, false);
    xmlHttp.send(null);

    lastServerUpdate = JSON.parse(xmlHttp.responseText) as ServerUpdate;
    queueId = lastServerUpdate.id;

    renderQueue();
}


function renderQueue() {
    var currentQueue = document.getElementById("current-queue") as HTMLInputElement;
    if (!queueId) {
        currentQueue.style.display = "none";
        return;
    } else {
        currentQueue.style.display = "block";
    }

    (document.getElementById("queue-name") as HTMLInputElement).innerHTML = "Queue " + queueId;

    var currentTime = lastServerUpdate.currentVideoTime;
    var videoQueue = lastServerUpdate.videos;

    if (!videoQueue.length) {
        console.log(`Queue ${queueId} is empty.`);
        var queue = document.getElementById("queue") as HTMLInputElement;
        queue.style.display = "none";
        player.stopVideo();
        return;
    }
    var newVideoId = videoQueue[0]['id'];
    var newVideoTitle = videoQueue[0]['title'];
    console.log("Updating queue from data", lastServerUpdate);

    let offset : number = Infinity;

    if (currentVideoId == newVideoId) {
        offset = Math.abs(currentTime - player.getCurrentTime());
    } else if (videoQueue.length > 1 && currentVideoId == videoQueue[1].id) {
        // already playing next one
        offset = Math.abs(currentTime - videoQueue[0].duration) + player.getCurrentTime();
    }

    if (player.getPlayerState() in [YT.PlayerState.BUFFERING, YT.PlayerState.PLAYING] == false) {
        console.log(`Starting video ${newVideoId}.`);
        setCurrentVideo(newVideoId, currentTime);
    } else if (offset > 10) {
        console.log(`Updating time, off by ${offset}.`);
        setCurrentVideo(newVideoId, currentTime);
    }

    (document.getElementById("current-video-title") as HTMLInputElement).innerHTML = newVideoTitle;
    let ul = document.getElementById("queued-videos-titles") as HTMLInputElement;
    ul.innerHTML = '';
    for (let i = 1; i < videoQueue.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = videoQueue[i].title;
        li.classList.add("list-group-item");
        ul?.appendChild(li);
    }

    var queue = document.getElementById("queue") as HTMLInputElement;
    queue.style.display = "block";
}

function setCurrentVideo(id : string, startSeconds : number) {
    currentVideoId = id;
    player.loadVideoById(currentVideoId, startSeconds, "large");
    player.playVideo();
}

function onVideoEnds() {
    console.log("Video ended, popping preemptively")
    lastServerUpdate.videos.shift();
    if (lastServerUpdate.videos.length) {
        setCurrentVideo(lastServerUpdate.videos[0].id, 0);
    }
}


let interval = setInterval(function () {
    updateQueueData();
}, 5000);