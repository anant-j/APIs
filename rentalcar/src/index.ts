import { totalPriceCalculator } from './calculator';
import { version } from '../package.json';
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
	async fetch(request: Request, env: any, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		const start = url.searchParams.get('start');
		const end = url.searchParams.get('end');
		const kms = url.searchParams.get('kms');

		if (start && end && kms) {
			var data = await totalPriceCalculator(start, end, Number(kms));
			data += `Version: ${version}`;
			return new Response(JSON.stringify(data));
		} else {
			return new Response('Invalid parameters');
		}
	},
};
