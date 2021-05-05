// Global state

function newQueue() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("PUT", '/queue', false);
    xmlHttp.send(null);

    // TODO: validate
    var data = JSON.parse(xmlHttp.responseText);
    var queueId = data.id;

    if (queueId) {
        window.location.href = '/queue/' + queueId;
    } else {
        // TODO: handle
    }
}
