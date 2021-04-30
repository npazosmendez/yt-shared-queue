import { Video } from "./video";


var queues: { [id: string] : Queue; } = {};

export class Queue {

    id : string;
    videos : [Video, number][] = [];

    async pushVideoById(videoId: string) {
        const v = await Video.createFromId(videoId);
        this.videos.push([v, Math.round(Date.now() / 1000)]);
    }
    getCurrentVideoTime() : number {
        if (this.videos.length) {
            return Math.round(Date.now() / 1000) - this.videos[0][1];;
        } else {
            return 0;
        }
    }

    getCurrentVideoId() : string {
        if (this.videos.length) {
            return this.videos[0][0].id;
        } else {
            return '';
        }
    }

    constructor() {
        this.id = randomStr();
        queues[this.id] = this;
    }

    static get(queueId: string): Queue | undefined {
        return queues[queueId];
    }
}


function randomStr(len : number = 10) : string {
    const chars = 'qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM';
    var result = '';
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.random() * chars.length);
    }
    return result;
}


