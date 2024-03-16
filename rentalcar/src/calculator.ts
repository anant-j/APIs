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
    let timeArray = timeString.split("-");
    let year = timeArray[0];
    let month = timeArray[1];
    let day = timeArray[2];
    let hour = timeArray[3];
    let minute = timeArray[4];
    let second = timeArray[5];
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

async function hoursCalculator(start: string, end: string): Promise<number> {
	let startTime = new Date(start);
	let endTime = new Date(end);
	let currentTime = await getCurrentTime();
	console.log(startTime)
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

export async function totalPriceCalculator(start: string, end: string, kms: number): Promise<string> {
	start = convertTimeStringToIsoFormat(start);
	end = convertTimeStringToIsoFormat(end);
	let hours: number;
	try {
		hours = await hoursCalculator(start, end);
		if (hours <= 0) {
			return 'Error with start and end dates: ' + hours.toString();
		}
		if (kms <= 0) {
			return 'Error with kms';
		}
	} catch (e: unknown) {
		return 'Error with start and end dates: ' + (e as Error).toString();
	}
	let evoTotal: string = evoCalculator(hours).toFixed(2);
	let modoTotal: string = (await modoCalculator(start, end, kms)).toFixed(2);
	let rentalTotal: string = rentalCalculator(hours, kms).toFixed(2);
	let final = '';
	final += 'Evo: $' + evoTotal + '<br/>';
	final += 'Modo: $' + modoTotal + '<br/>';
	final += 'Rental: $' + rentalTotal + '<br/>';
	return final;
}
