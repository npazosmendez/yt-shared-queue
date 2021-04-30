var queueId: string;
var videoId: string;

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

    if (!videoId) {
        updateQueue();
    }
}

function updateQueue() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/queue/' + queueId, false);
    xmlHttp.send(null);

    var data = JSON.parse(xmlHttp.responseText);
    console.log(data);
    queueId = data['id'];

    let f = document.getElementById("currentQueue") as HTMLInputElement;
    f.innerHTML = "Queue " + queueId;

    var newVideoId = data['currentVideo'];
    var currentTime = data['currentTime'];

    console.log("current time " + player.getCurrentTime())
    var offset = Math.abs(currentTime - player.getCurrentTime());
    console.log("offset:" + offset)
    if (videoId != newVideoId) {
        videoId = newVideoId;
        player.loadVideoById(videoId, currentTime, "large");
        player.playVideo();
    } else if (offset > 10) {
        console.log("updating time..")
        player.seekTo(currentTime, true);    }
}

function connectToQueue() {
    // TODO: validate
    queueId = (document.getElementById("queueIdInput") as HTMLInputElement).value;
    updateQueue();
    let interval = setInterval(function () {
        updateQueue();
    }, 5000);

    //- socket = new WebSocket('ws://localhost:8088/' + queueId);

    //- socket.addEventListener('open', function(event) {
    //-   socket.send('Hello from Client!');
    //- });

    //- socket.addEventListener('message', function(event) {
    //-   var data = JSON.parse(event.data);
    //-   console.log(data);
    //-   var newVideoId = data['videoId'];
    //-   var currentTime = data['time'];
    //-   console.log("current time " + player.getCurrentTime())
    //-   var offset = Math.abs(currentTime - player.getCurrentTime());
    //-   console.log("offset:" + offset)
    //-   if (videoId != newVideoId) {
    //-     videoId = newVideoId;
    //-     player.loadVideoById(videoId, 0, "large");
    //-   } else if (offset > 10) {
    //-     console.log("updating time..")
    //-     player.loadVideoById(videoId, currentTime, "large");
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

