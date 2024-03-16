import { getData } from "./seymour";
import { version } from "../package.json";
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		switch (path) {
			case "/ski":
			case "/snowboard":{
				const updatedPath = path.slice(1); 
				const data = await getData(updatedPath);
				return new Response(JSON.stringify(data));
			}
			default: {
				return new Response(`OK @${version}`);
			}
		}
	},
};
