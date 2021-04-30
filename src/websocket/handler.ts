import express from "express";
import WebSocket from 'ws';
import { Queue } from "../model/queue";


export function connectionHandler(ws: WebSocket, req : express.Request) {
    const queueId = req.url.substring(1);
    console.log(`Client requesting queue ${queueId}`);
    const q = Queue.get(queueId);
    if (q) {
        ws.on('message', (message) => {
            console.log('Message from Client: %s', message);
            ws.send(JSON.stringify({
                "id": q.id,
                "videoId": "flOf-TxZn0c",
                "time": 0
            }));
        })
        ws.send(`Connnected to queue ${queueId}`);
    } else {
        ws.close(4001, `Queue ${queueId} does not exist.`);
    }
}
