const MODO_API_URL = "https://marketing-proxy.modo.coop/api/trip_calculator";

export async function modoCalculator(start: string, end: string, kms: number) {
    let url = MODO_API_URL;
    let headers = {
        "authority": "marketing-proxy.modo.coop",
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "dnt": "1",
        "origin": "https://www.modo.coop",
        "referer": "https://www.modo.coop/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    };

    let params = {
        "start_time": `${start}-0800`,
        "end_time": `${end}-0800`,
        "distance": kms.toString(), // Convert the distance to a string
        "rate_class": "0",
        "open_return": "0",
    };

    const urlWithParams = new URL(url);
    urlWithParams.search = new URLSearchParams(params).toString();
    let response = await fetch(urlWithParams, { method: 'GET', headers: headers });
    if (response.status !== 200) {
        console.log(response);
        return -1;
    }
    let data: any = await response.json();

    // Extract total from the "Member-Owner" part of the response
    let memberOwnerTotal = data["Member-Owner"]?.total;

    if (memberOwnerTotal !== undefined) {
        return memberOwnerTotal;
    } else {
        console.log(data);
        return -1;
    }
}
