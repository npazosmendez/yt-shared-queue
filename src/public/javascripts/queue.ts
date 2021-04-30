var queueId: string;
var currentVideoId: string;
var videoQueue : { 'id': string, 'title': string, 'duration' : number }[];

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
    updateQueue();

}

function addToQueue() {
    if (queueId) {
        var videoUrl = (document.getElementById("videoUrlInput") as HTMLInputElement).value;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", '/queue/' + queueId + '/push', false);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send(`{"url": "${videoUrl}"}`);
    }

    if (!currentVideoId) {
        updateQueue();
    }
}

function updateQueue() {
    if (!queueId) {
        console.log("No queue to update.")
        return;
    }
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/queue/' + queueId, false);
    xmlHttp.send(null);

    var data = JSON.parse(xmlHttp.responseText);
    queueId = data['id'];

    (document.getElementById("queue-name") as HTMLInputElement).innerHTML = "Queue " + queueId;

    var currentTime = data['currentVideoTime'];
    videoQueue = data['videos'] as { 'id': string, 'title': string, 'duration': number }[]

    if (!videoQueue.length) {
        console.log(`Queue ${queueId} is empty.`);
        var queue = document.getElementById("queue") as HTMLInputElement;
        queue.style.display = "none";
        return;
    }
    var newVideoId = videoQueue[0]['id'];
    var newVideoTitle = videoQueue[0]['title'];
    console.log("Updating queue from data", data);

    var offset = Math.abs(currentTime - player.getCurrentTime());

    if (videoQueue.length > 1 && currentVideoId == videoQueue[1].id &&
        Math.abs(currentTime - videoQueue[0].duration) + player.getCurrentTime() < 10) {
        console.log("Client already in next video.")
    } else if (currentVideoId != newVideoId) {
        console.log(`Changing current video from ${currentVideoId} to ${newVideoId}.`);
        currentVideoId = newVideoId;
        player.loadVideoById(currentVideoId, currentTime, "large");
        player.playVideo();
    } else if (offset > 10) {
        console.log(`Updating time, off by ${currentTime} - ${player.getCurrentTime()} = ${offset}.`);
        player.seekTo(currentTime, true);
    }

    console.log("Offset is", offset);

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


function onVideoEnds() {
    console.log("Video ended, poping preemptively")
    videoQueue.shift();
    if (videoQueue.length) {
        currentVideoId = videoQueue[0].id;
        player.loadVideoById(videoQueue[0].id, 0, "large");
        player.playVideo();
    }
}

function connectToQueue() {
    // TODO: validate
    queueId = (document.getElementById("queueIdInput") as HTMLInputElement).value;
    updateQueue();

    //- socket = new WebSocket('ws://localhost:8088/' + queueId);

    //- socket.addEventListener('open', function(event) {
    //-   socket.send('Hello from Client!');
    //- });

    //- socket.addEventListener('message', function(event) {
    //-   var data = JSON.parse(event.data);
    //-   console.log(data);
    //-   var newVideoId = data['currentVideoId'];
    //-   var currentTime = data['time'];
    //-   console.log("current time " + player.getCurrentTime())
    //-   var offset = Math.abs(currentTime - player.getCurrentTime());
    //-   console.log("offset:" + offset)
    //-   if (currentVideoId != newVideoId) {
    //-     currentVideoId = newVideoId;
    //-     player.loadVideoById(currentVideoId, 0, "large");
    //-   } else if (offset > 10) {
    //-     console.log("updating time..")
    //-     player.loadVideoById(currentVideoId, currentTime, "large");
    //-   }
    //- });

    //- socket.addEventListener('close', function(event) {
    //-   if (event.code == 4001) {
    //-     document.getElementById("connectedQueue").innerHTML = event.reason;
    //-   } else {
    //-     console.log('Connection closed:' + event.code)
    //-   }
    //- });

    //- interval = setInterval(function() {
    //-   if (socket && socket.readyState != WebSocket.CLOSED) {
    //-     socket.send("ping");
    //-   }
    //- }, 5000);


}

let interval = setInterval(function () {
    updateQueue();
}, 5000);