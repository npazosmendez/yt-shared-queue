import { Video } from "./video";


var queues: { [id: string] : Queue; } = {};

export class Queue {

    id : string;
    currentVideoStartTime : number;
    videos : Video[] = [];

    async pushVideoByUrl(videoUrl: string) {
        if (!this.videos.length) {
            this.currentVideoStartTime = Math.round(Date.now() / 1000);
        }
        const v = await Video.createFromUrl(videoUrl);
        this.videos.push(v);
    }

    getCurrentVideoTime() : number {
        this.updateQueue();
        if (this.videos.length) {
            return Math.round(Date.now() / 1000) - this.currentVideoStartTime;
        } else {
            return 0;
        }
    }

    getCurrentVideoId() : string {
        this.updateQueue();
        if (this.videos.length) {
            return this.videos[0].id;
        } else {
            return '';
        }
    }

    private updateQueue() {
        if (this.videos.length) {
            const elapsed = Math.round(Date.now() / 1000) - this.currentVideoStartTime;
            const duration = this.videos[0].durationSeconds;
            if (elapsed - duration > 3) {
                this.videos.shift();
                this.currentVideoStartTime = Math.round(Date.now() / 1000);
            }
        }
    }

    constructor() {
        this.id = randomStr();
        this.currentVideoStartTime = 0;
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


