import { rmSync } from 'fs';
import { open, RootDatabase } from 'lmdb-store';
import { Client } from 'pg';

const DB_PATH = process.env.DB_PATH;
const DATABASE_URL = process.env.DATABASE_URL

export interface Store {
    doesExist(queueId: string) : Promise<boolean>
	put(id: string, val: any) : Promise<void>
	get(id: string) : Promise<any | undefined>
}

export let store : Store;

export async function initStore() : Promise<void> {
	if (DATABASE_URL) {
		let pgStore = new PostgresStore(DATABASE_URL);
		console.log("Using postgres, connecting...")
		await pgStore.connect()
		store = pgStore
	} else {
		store =  new FileStore(DB_PATH || 'store.db')
	}
}

class PostgresStore {
	client : Client
	constructor(dbStr: string) {
		this.client = new Client(dbStr)
	}

	async connect() {
		await this.client.connect()
		const res = await this.client.query(`
		CREATE TABLE IF NOT EXISTS items (
			id TEXT PRIMARY KEY,
			value JSONB
		 );
		`)
		console.log(res)
	}

	async put(id: string, val: any) : Promise<void> {
		const res = await this.client.query(`
			INSERT INTO items(id, value) 
				VALUES($1, $2)
				ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;
			`,
			[id, JSON.stringify(val)],
		)
		console.log(res)
	}

	async get(id: string) : Promise<any | undefined> {
		const res = await this.client.query(`
			SELECT value FROM items WHERE id = $1;
			`,
			[id]
		)
		if (res.rows) {
			console.log(res.rows)
			console.log(res.rows[0]['value'])
			return res.rows[0]['value']
		} else {
			return undefined
		}
	}

    async doesExist(queueId: string) : Promise<boolean> {
		const res = await this.client.query(`
			SELECT id FROM items WHERE id = $1;
			`,
			[queueId]
		)
		return res.rowCount == 1
	}
}

class FileStore {
	lmdbStore : RootDatabase
	constructor(filepath: string) {
		this.lmdbStore = open({
			path: filepath,
		});
	}

	async put(id: string, val: any) : Promise<void> {
		this.lmdbStore.put(id, val)
	}

	async get(id: string) : Promise<any | undefined> {
		return this.lmdbStore.get(id)
	}
    async doesExist(queueId: string) : Promise<boolean> {
		return this.lmdbStore.doesExist(queueId)
	}
}
