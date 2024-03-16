import * as skiData from '../src/ski';
import * as snowboardData from '../src/snowboard';

const requestEndpoint = 'https://mtseymour.secure.na2.accessoticketing.com/api/request/getkeywordcombocreator';
const headers = {
	authority: 'mtseymour.secure.na2.accessoticketing.com',
	accept: 'application/json, text/plain, */*',
	'accept-language': 'en-US,en;q=0.9',
	'cache-control': 'no-cache',
	'com-accessopassport-app-id': '1500',
	'com-accessopassport-client': 'accesso105',
	'com-accessopassport-language': 'en-ca',
	'com-accessopassport-merchant-id': '100',
	'content-type': 'application/json;charset=UTF-8',
	origin: 'https://mtseymour.secure-cdn.na2.accessoticketing.com',
	pragma: 'no-cache',
	referer: 'https://mtseymour.secure-cdn.na2.accessoticketing.com/',
	'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
	'sec-ch-ua-mobile': '?0',
	'sec-ch-ua-platform': '"Windows"',
	'sec-fetch-dest': 'empty',
	'sec-fetch-mode': 'cors',
	'sec-fetch-site': 'same-site',
	'user-agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
};

export async function getData(typeOfActivity: string) {
	let jsonData: any,
		code: string | null = null;
	let data: any[] = [];
	switch (typeOfActivity) {
		case 'ski':
			code = skiData.code;
			jsonData = skiData.jsonData;
			break;
		case 'snowboard':
			code = snowboardData.code;
			jsonData = snowboardData.jsonData;
			break;
		default:
			return data;
	}
	try {
		const response = await fetch(requestEndpoint, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(jsonData),
		});

		const responseData: any = await response.json();
		for (const date_item of responseData.SERVICE.DATES.D) {
			const date = date_item.date;
			const pricing_items = date_item.PS.P;
			for (const pricing_item of pricing_items) {
				if (pricing_item.id == code) {
					for (const ct_item of pricing_item.CT) {
						if (ct_item.id == '288') {
							if (Array.isArray(ct_item.A)) {
								for (const val2_item of ct_item.A) {
									const start_time = val2_item.start;
									const amount = ct_item.retail_amount;
									const ski_data_item = { date: date, amount: amount, available: val2_item.available, start: start_time };
									data.push(ski_data_item);
								}
							} else {
								const start_time = ct_item.A.start;
								const amount = ct_item.retail_amount;
								const ski_data_item = { date: date, amount: amount, available: ct_item.A.available, start: start_time };
								data.push(ski_data_item);
							}
						}
					}
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
	return data;
}
