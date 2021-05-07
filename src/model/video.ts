import axios from "axios";
import {parse, toSeconds} from 'iso8601-duration';
import {Memoize} from 'typescript-memoize';
import yts from 'yt-search';

export class Video {
    constructor(public id : string, public title : string, public durationSeconds : number) {}

    static getIdFromURL(urlString : string) : string | undefined {
        var id = undefined;
        try {
            const url = new URL(urlString);
            id = url.searchParams.get('v') || undefined;
        } catch {
            console.log(`Invalid URL '${urlString}'`)
        }
        return id;
    }

    @Memoize()
    public static async createFromId(id : string) : Promise<Video | undefined> {
        const API_KEY = process.env.GOOGLE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=contentDetails,snippet&key=${API_KEY}`;
        const response = await axios.get(url);
        if (response.status == 200) {
            const durationString = response.data.items[0].contentDetails.duration;
            const title = response.data.items[0].snippet.title;
            const seconds = toSeconds( parse(durationString));
            console.log(`Creted video with id=${id} title='${title}' duration=${seconds}s`);
            return new Video(id, title, seconds);
        } else {
            console.error("YouTube API call failed.");
            return undefined;
        }
    }

    public static async createFromQuery(query : string) : Promise<Video | undefined> {
        try{
            const r = await yts({query: query, pages: 1});
            if (r.videos.length) {
                const v = r.videos[0];
                return new Video(v.videoId, v.title, v.duration.seconds);
            }
        } catch {
            console.error("YouTube search failed.");
        }
        return undefined;
    };
}