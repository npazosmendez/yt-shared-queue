// Global state

function newQueue() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("PUT", '/queue', false);
    xmlHttp.send(null);

    // TODO: validate
    var data = JSON.parse(xmlHttp.responseText);
    var queueId = data.id;

    let input = document.getElementById("queueIdInput") as HTMLInputElement;
    if (queueId) {
        input.value = queueId;
        goToQueue();
    } else {
        // TODO: handle
    }
}

function goToQueue() {
    var queueId = (document.getElementById("queueIdInput") as HTMLInputElement).value;
    window.location.href = '/queue/' + queueId;
}

