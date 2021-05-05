import { store } from "./store";
import { Video } from "./video";

export type QueueState = { id: string, currentVideoTime: number, listeners: number, videos: { id: number, youtubeId: string, title: string, duration: number }[] };
type SubscriberCallback = (s: QueueState) => void;

var subscriptions: { [queueId: string]: { [subscriberId: string]: SubscriberCallback; } } = {};

// TODO: these functions are not methods to avoid triggering observers notifications with out of date instances of Queues. Works for now, but I'm considering queue-scoped locks. Or maybe a RDBMS.
export function addObserver(queueId: string, observerId: string, callback: SubscriberCallback) {
    const q = Queue.get(queueId);
    if (q) {
        var queueSubscriptions = subscriptions[q.id] ? subscriptions[q.id] : subscriptions[q.id] = {};
        queueSubscriptions[observerId] = callback;
        q.notifyObservers();
    }
}

export function removeObserver(queueId: string, observerId: string) {
    const q = Queue.get(queueId);
    if (q) {
        delete subscriptions[q.id][observerId];
        q.notifyObservers();
    }
}

// TODO: race conditions everywhere
export class Queue {

    id: string;
    private currentVideoStartTime: number;
    private videos: [number, Video][] = [];
    private videoIdInc = 1;

    async pushVideo(v: Video) {
        this.updateQueue();
        if (!this.videos.length) {
            this.currentVideoStartTime = Math.round(Date.now() / 1000);
        }
        this.videos.push([this.videoIdInc++, v]);
        this.save();
        this.notifyObservers();
    }

    getState(): QueueState {
        this.updateQueue();
        return {
            'id': this.id,
            'videos': this.videos.map(iv => ({
                'id': iv[0],
                'youtubeId': iv[1].id,
                'title': iv[1].title,
                'duration': iv[1].durationSeconds
            })),
            'currentVideoTime': this.getCurrentVideoTime(),
            'listeners': Object.keys(subscriptions[this.id] || {}).length,
        }
    }

    removeVideo(id: number): boolean {
        this.updateQueue();
        var i = this.videos.findIndex(iv => iv[0] == id);
        if (i != -1) {
            this.videos.splice(i, 1);
            if (i == 0) {
                this.currentVideoStartTime = Math.round(Date.now() / 1000);
            }
            this.save();
            this.notifyObservers();
        }
        return i != -1;;
    }

    private getCurrentVideoTime(): number {
        this.updateQueue();
        if (this.videos.length) {
            return Math.round(Date.now() / 1000) - this.currentVideoStartTime;
        } else {
            return 0;
        }
    }

    private updateQueue() {
        if (this.videos.length) {
            const now = Math.round(Date.now() / 1000);
            var videoEndTime = this.currentVideoStartTime;
            while (this.videos.length && now > videoEndTime + this.videos[0][1].durationSeconds) {
                videoEndTime += this.videos[0][1].durationSeconds
                const last = this.videos.shift() as [number, Video];
            }
            if (!this.videos.length) {
                this.currentVideoStartTime = 0;
            } else {
                this.currentVideoStartTime = videoEndTime;
            }
            this.save();
        }
    }

    public notifyObservers() {
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


function randomStr(len: number = 10): string {
    const chars = 'qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM';
    var result = '';
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.random() * chars.length);
    }
    return result;
}


