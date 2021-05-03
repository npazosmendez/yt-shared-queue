import { open } from 'lmdb-store';

const DB_PATH = process.env.DB_PATH;

export const store = open({
	path: DB_PATH || 'store.db',
	// compression: true,
});