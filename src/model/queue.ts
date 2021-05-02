import { Video } from "./video";

export type QueueState = {id : string, currentVideoTime : number, videos : {id: number, youtubeId: string, title: string, duration : number }[]};
type ObserverCallback = (s: QueueState) => void;

var queues: { [id: string] : Queue; } = {};

// TODO: race conditions everywhere
export class Queue {

    id : string;
    private currentVideoStartTime : number;
    private videos : [number, Video][] = [];
    private observers : { [id: string] : ObserverCallback; } = {};
    private videoIdInc = 1;

    async pushVideoByUrl(videoUrl: string) {
        if (!this.videos.length) {
            this.currentVideoStartTime = Math.round(Date.now() / 1000);
        }
        const v = await Video.createFromUrl(videoUrl);
        this.videos.push([this.videoIdInc++, v]);
        this.updateQueue();
        this.notifyObservers();
    }

    addObserver(id : string, callback : ObserverCallback) {
        this.observers[id] = callback;
    }

    removeObserver(id : string) {
        // TODO: check if exists?
        delete this.observers[id];
    }

    getState() : QueueState {
        this.updateQueue();
        return {
            'id': this.id,
            'videos': this.videos.map(iv  => ({
                'id': iv[0],
                'youtubeId': iv[1].id,
                'title': iv[1].title,
                'duration': iv[1].durationSeconds
            })),
            'currentVideoTime': this.getCurrentVideoTime(),
          }
    }

    private getCurrentVideoTime() : number {
        this.updateQueue();
        if (this.videos.length) {
            return Math.round(Date.now() / 1000) - this.currentVideoStartTime;
        } else {
            return 0;
        }
    }

    private updateQueue() {
        if (this.videos.length) {
            const elapsed = Math.round(Date.now() / 1000) - this.currentVideoStartTime;
            const duration = this.videos[0][1].durationSeconds;
            if (elapsed - duration > 0) {
                const last = this.videos.shift() as [number, Video];
                if (this.videos.length) {
                    this.currentVideoStartTime = this.currentVideoStartTime + last[1].durationSeconds
                } else {
                    this.currentVideoStartTime = 0;
                }
            }
        }
    }

    private notifyObservers() {
        var s = this.getState();
        for (let c in this.observers) {
            this.observers[c](s);
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


