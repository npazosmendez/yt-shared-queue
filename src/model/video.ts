import axios from "axios";
import {parse, toSeconds} from 'iso8601-duration';
import {Memoize} from 'typescript-memoize';

export class Video {
    constructor(public id : string, public durationSeconds : number) {}

    static async createFromUrl(urlString : string) : Promise<Video> {
        const url = new URL(urlString);
        const id = url.searchParams.get('v');
        if (id) {
            return Video.createFromId(id);
        } else {
            throw Error("Invalid url" + url);
        }
    }

    @Memoize()
    private static async createFromId(id : string) : Promise<Video> {
        const API_KEY = process.env.GOOGLE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=contentDetails&key=${API_KEY}`;
        const response = await axios.get(url);
        if (response.status == 200) {
            const durationString = response.data.items[0].contentDetails.duration;
            const seconds = toSeconds( parse(durationString));
            console.log(`"Creted video with id=${id} with duration=${seconds}s`);
            return new Video(id, seconds);
        } else {
            throw new Error("YouTube API call failed.");
        }
    }
}