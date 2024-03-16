import requests
import seymour.ski
import seymour.snowboard
requestEndpoint = 'https://mtseymour.secure.na2.accessoticketing.com/api/request/getkeywordcombocreator'
headers = {
    'authority': 'mtseymour.secure.na2.accessoticketing.com',
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'com-accessopassport-app-id': '1500',
    'com-accessopassport-client': 'accesso105',
    'com-accessopassport-language': 'en-ca',
    'com-accessopassport-merchant-id': '100',
    'content-type': 'application/json;charset=UTF-8',
    'origin': 'https://mtseymour.secure-cdn.na2.accessoticketing.com',
    'pragma': 'no-cache',
    'referer': 'https://mtseymour.secure-cdn.na2.accessoticketing.com/',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
}


def getData(typeOfActivity):
    jsonData, code = None, None
    data = []
    match typeOfActivity:
        case "ski":
            code = seymour.ski.code
            jsonData = seymour.ski.jsonData
        case "snowboard":
            code = seymour.snowboard.code
            jsonData = seymour.snowboard.jsonData
        case _:
            return data
    try:
        response = requests.post(
            requestEndpoint,
            headers=headers,
            json=jsonData,
        )

        for date_item in response.json().get('SERVICE', {}).get('DATES', {}).get('D', []):
            date = date_item.get('date')
            pricing_items = date_item.get('PS', {}).get('P', [])
            for pricing_item in pricing_items:
                # if pricing_item.get('id') == "5269-sno" or "5275-ski":
                if pricing_item.get('id') == code:
                    for ct_item in pricing_item.get('CT', []):
                        if ct_item.get('id') == '288':
                            if isinstance(ct_item.get('A'), list):
                                for val2_item in ct_item.get('A', []):
                                    start_time = val2_item.get('start')
                                    amount = ct_item.get('retail_amount')
                                    data = {"date": date, "amount": amount, "available": val2_item.get(
                                        'available'), "start": start_time}
                                    data.append(ski_data_item)
                            else:
                                start_time = ct_item.get('A', {}).get('start')
                                amount = ct_item.get('retail_amount')
                                ski_data_item = {"date": date, "amount": amount, "available": ct_item.get(
                                    'A', {}).get('available'), "start": start_time}
                                data.append(ski_data_item)
    except Exception as e:
        print(e)
    return data


# testing
# print(len(getData("ski")))
# print(len(getData("snowboard")))
