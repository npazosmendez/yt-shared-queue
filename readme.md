# YTSharedQueue

Shared queues for YouTube videos, synced across the clients' players.

> https://ytsharedqueue.herokuapp.com/

## Development

Run with hot reload enabled:

```
npm install
npm run dev
```

Contributions and ideas are welcome.

Pending technical improvements:

- [ ] Rewrite and clean the frontend. Using a framework might be a good idea.
- [ ] Improve storage and queue-subscription management. Make it more resistant to concurrency. Also, manage the Queue schema versioning somehow; al least fail-fast when the store has old schemas.
- [ ] Better logging and error handling (both back and front).

Features I have in mind:

- [ ] Support syncing time changes and/or pauses in current video (right now, the server dictates the pace for everyone and can't be modified)
- [ ] Queue permissions (listen-only vs edit)
- [ ] Show active/recent queues in home page
- [ ] Support custom names for queues
- [ ] "Circular" queues?
- [ ] Recommend videos for queue?
- [ ] Static infinite queues to join quickly (e.g. 'Rock playlist')
