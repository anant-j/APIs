import datetime
import requests

MODO_API_URL = "https://marketing-proxy.modo.coop/api/trip_calculator"
TIME_FORMAT = "%Y-%m-%d-%H-%M-%S"


def convert_time_string_to_modo_format(time_string):
    time = datetime.datetime.strptime(time_string, TIME_FORMAT)
    return time.strftime("%Y-%m-%d %H:%M:%S")


def modo_calculator(start, end, kms):
    start = convert_time_string_to_modo_format(start)
    end = convert_time_string_to_modo_format(end)
    url = MODO_API_URL
    headers = {
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
    }

    params = {
        "start_time": f"{start}-0800",
        "end_time": f"{end}-0800",
        "distance": kms,
        "rate_class": "0",
        "open_return": "0",
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    # Extract total from the "Member-Owner" part of the response
    member_owner_total = data.get("Member-Owner", {}).get("total", None)

    if member_owner_total is not None:
        return (member_owner_total)
    else:
        print(data)
        return (-1)
