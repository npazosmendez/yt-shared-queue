import { store } from "./store";
import { Video } from "./video";

export type QueueState = {id : string, currentVideoTime : number, videos : {id: number, youtubeId: string, title: string, duration : number }[]};
type SubscriberCallback = (s: QueueState) => void;

var subscriptions : { [queueId : string] : { [subscriberId: string] : SubscriberCallback; } } = {};

// TODO: race conditions everywhere
export class Queue {

    id : string;
    private currentVideoStartTime : number;
    private videos : [number, Video][] = [];
    private videoIdInc = 1;

    async pushVideoByUrl(videoUrl: string) {
        if (!this.videos.length) {
            this.currentVideoStartTime = Math.round(Date.now() / 1000);
        }
        const v = await Video.createFromUrl(videoUrl);
        this.videos.push([this.videoIdInc++, v]);
        this.save();
        this.updateQueue();
        this.notifyObservers();
    }

    addObserver(id : string, callback : SubscriberCallback) {
        var queueSubscriptions = subscriptions[this.id] ? subscriptions[this.id] : subscriptions[this.id] = {};
        queueSubscriptions[id] = callback;
    }

    removeObserver(id : string) {
        // TODO: check if exists?
        delete subscriptions[this.id][id];
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

    removeVideo(id : number) : boolean {
        var i = this.videos.findIndex(iv => iv[0] == id);
        if (i != -1) {
            this.videos.splice(i, 1);
            if (i == 0) {
                this.currentVideoStartTime = Math.round(Date.now() / 1000);
            }
            this.save();
            this.updateQueue();
            this.notifyObservers();
        }
        return i != -1;;
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
        // FIXME: multiple videos may have ended
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
                this.save();
            }
        }
    }

    private notifyObservers() {
        var s = this.getState();
        var queueSubscriptions = subscriptions[this.id] || {};
        for (let c in queueSubscriptions) {
            queueSubscriptions[c](s);
        }
    }

    constructor() {
        this.id = randomStr();
        this.currentVideoStartTime = 0;
        store.put(this.id, this);
    }

    static get(queueId: string): Queue | undefined {
        var result = store.get(queueId) as Queue;
        if (result) Object.setPrototypeOf(result, Queue.prototype);
        return result;
    }

    private save() {
        store.put(this.id, this);
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


