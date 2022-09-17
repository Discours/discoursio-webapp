

import { createServer } from 'http';
import fs from 'fs';
import mime from 'mime';
import { handler as ssrHandler } from '../dist/server/entry.mjs';

const clientRoot = new URL('../dist/client/', import.meta.url);

async function handle(req, res) {
	ssrHandler(req, res, async (err) => {
		if (err) {
			res.writeHead(500);
			res.end(err.stack);
			return;
		}

		let local = new URL('.' + req.url, clientRoot);
		try {
			const data = await fs.promises.readFile(local);
			res.writeHead(200, {
				'Content-Type': mime.getType(req.url),
			});
			res.end(data);
		} catch {
			res.writeHead(404);
			res.end();
		}
	});
}

const server = createServer((req, res) => {
	handle(req, res).catch((error) => {
		console.error('[ssr] server error', error);
		res.writeHead(500, {
			'Content-Type': 'text/plain',
		});
		res.end(error.toString());
	});
});

server.listen(8085);
console.log('[ssr] serving at http://localhost:8085');

// Silence weird <time> warning
console.error = () => {};
