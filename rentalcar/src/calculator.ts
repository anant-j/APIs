import { modoCalculator } from './modo';
const EVO_DAILY_COST = 104.99;
const EVO_HOURLY_COST = 17.99;
const EVO_COST_THRESHOLD = EVO_DAILY_COST / EVO_HOURLY_COST;
const RENTAL_PER_DAY_RATE = 60;
const KM_COST = 0.1;
const TIME_API_URL = 'http://worldtimeapi.org/api/timezone/America/Vancouver';

function evoCalculator(hours: number): number {
	let totalFullDay = Math.floor(hours / 24);
	let remainingHours = hours % 24;
	if (remainingHours >= EVO_COST_THRESHOLD) {
		totalFullDay += 1;
		remainingHours = 0;
	}
	let totalCost = totalFullDay * EVO_DAILY_COST + remainingHours * EVO_HOURLY_COST;
	if (totalFullDay > 0) {
		totalCost += 1.5; // PVRT
	}
	totalCost += 1.25; // One time fee
	totalCost = totalCost * 1.12; // Tax
	return totalCost;
}

function rentalCalculator(hours: number, kms: number): number {
	let totalFullDay = Math.floor(hours / 24);
	let remainingHours = hours % 24;
	let totalDayCost = (totalFullDay + Number(Boolean(remainingHours))) * RENTAL_PER_DAY_RATE;
	let totalKmCost = kms * KM_COST;
	let totalCost = totalDayCost + totalKmCost;
	return totalCost;
}

function convertTimeStringToIsoFormat(timeString: string): string {
	// convert time in format "2022-02-02-10-00-00" to "Y-m-d H:i:sO."
	let timeArray = timeString.split('-');
	let year = timeArray[0];
	if (year.length < 4) {
		year = '20' + year;
	}
	let month = timeArray[1];
	if (month.length < 2) {
		month = '0' + month;
	}
	let day = timeArray[2];
	if (day.length < 2) {
		day = '0' + day;
	}
	let hour = timeArray[3];
	if (hour.length < 2) {
		hour = '0' + hour;
	}
	let minute = timeArray[4];
	if (minute.length < 2) {
		minute = '0' + minute;
	}
	let second = timeArray[5];
	if (second.length < 2) {
		second = '0' + second;
	}
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

async function hoursCalculator(start: string, end: string): Promise<number> {
	let startTime = new Date(start);
	let endTime = new Date(end);
	let currentTime = await getCurrentTime();
	console.log(startTime);
	if (startTime > endTime) {
		return -1;
	}
	if (startTime < currentTime || endTime < currentTime) {
		console.log({ start: startTime, end: endTime, current: currentTime });
		return -2;
	}
	let difference = endTime.getTime() - startTime.getTime();
	let totalHours = difference / 1000 / 3600;
	return totalHours;
}

async function getCurrentTime(): Promise<Date> {
	try {
		let response = await fetch(TIME_API_URL);
		let data: any = await response.json(); // Add type assertion here
		let currentTime = new Date(data.datetime);
		return currentTime;
	} catch (e) {
		return new Date();
	}
}

export async function totalPriceCalculator(start: string, end: string, kms: number): Promise<any> {
	// create object to store results
	let result: any = {};
	start = convertTimeStringToIsoFormat(start);
	end = convertTimeStringToIsoFormat(end);
	let hours: number;
	try {
		hours = await hoursCalculator(start, end);
		if (hours <= 0) {
			result.status = 'Error with start and end dates. Hours cannot be negative:' + hours.toString();
			return result;
		}
		if (kms <= 0) {
			result.status = 'Error with kms. Kms cannot be negative. Kms value: ' + kms.toString();
			return result;
		}
	} catch (e: unknown) {
		return 'Error with start and end dates: ' + (e as Error).toString();
	}
	let evoTotal: string = evoCalculator(hours).toFixed(2);
	let modoTotal: string = (await modoCalculator(start, end, kms)).toFixed(2);
	let rentalTotal: string = rentalCalculator(hours, kms).toFixed(2);
	result['modo'] = modoTotal;
	result['evo'] = evoTotal;
	result['rental'] = rentalTotal;
	result['status'] = 'Success';
	return result;
}
