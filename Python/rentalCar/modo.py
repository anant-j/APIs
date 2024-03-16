import datetime
import requests

# def modo_calculator(start_time, end_time, kms_driven):
#     # Define rates and constants
#     regular_hourly_rate = 4  # $4 per hour
#     max_daily_rate = 48  # Max. $48 for 24 hours
#     first_25km_rate = 0.4  # 40c/km for first 25 kms
#     remaining_km_rate = 0.28  # 28c/km for remaining kms
#     trip_fee = 1.5  # $1.50 added per trip
#     day_tripper_rate = 90  # Day Tripper rate for 250km in 24 hours
#     overnight_start_hour = 18  # 6 p.m.
#     overnight_end_hour = 9  # 9 a.m.
#     tax_rate = 0.12  # 12% tax rate
#     pvrt_threshold_hours = 8  # PVRT threshold for additional charge
#     pvrt_charge = 1.5  # PVRT charge per 24 hours

#     # Parse input times
#     start_time = datetime.strptime(start_time, '%Y-%m-%d-%H-%M-%S')
#     end_time = datetime.strptime(end_time, '%Y-%m-%d-%H-%M-%S')

#     # Calculate total hours
#     total_hours = (end_time - start_time).total_seconds() / 3600

#     # Check for overnight hours
#     if start_time.hour >= overnight_start_hour or end_time.hour <= overnight_end_hour:
#         total_hours = min(total_hours, 3)
#     elif start_time.hour < overnight_start_hour and end_time.hour > overnight_end_hour:
#         total_hours -= min(overnight_end_hour - start_time.hour, 3)

#     # Calculate regular bill
#     regular_bill = min(total_hours * regular_hourly_rate, max_daily_rate)

#     # Calculate distance-based charges
#     if kms_driven <= 25:
#         distance_charge = kms_driven * first_25km_rate
#     else:
#         distance_charge = 25 * first_25km_rate + (kms_driven - 25) * remaining_km_rate

#     # Calculate total bill without Day Tripper rate
#     total_bill_regular = regular_bill + distance_charge + trip_fee

#     # Check for Day Tripper rate eligibility
#     if total_hours <= 24 and kms_driven <= 250:
#         total_bill_day_tripper = day_tripper_rate
#     else:
#         total_bill_day_tripper = float('inf')

#     # Calculate PVRT charge
#     pvrt_hours = max(total_hours - pvrt_threshold_hours, 0)
#     pvrt_charge_total = (pvrt_hours // 24) * pvrt_charge

#     # Calculate total bill before tax
#     total_bill_before_tax = min(total_bill_regular, total_bill_day_tripper) + pvrt_charge_total

#     # Calculate tax
#     tax_amount = total_bill_before_tax * tax_rate

#     # Calculate final bill considering tax
#     final_bill = total_bill_before_tax + tax_amount

#     # Breakdown of the bill
#     breakdown = {
#         "Regular Hourly Rate": min(total_hours * regular_hourly_rate, max_daily_rate),
#         "Distance-Based Charges": distance_charge,
#         "Trip Fee": trip_fee,
#         "Day Tripper Rate": min(total_bill_day_tripper, total_bill_regular),
#         "PVRT Charge": pvrt_charge_total,
#         "Tax (12%)": tax_amount,
#         "Final Total": final_bill
#     }

#     print(breakdown)
#     return final_bill, breakdown

# Example usage
# start_time = '2024-01-01 19:00'
# end_time = '2024-01-02 06:00'
# kms_driven = 112

# final_bill, breakdown = modo_calculator(start_time, end_time, kms_driven)

# Display breakdown to the user
# print("Breakdown of the Bill:")
# for item, amount in breakdown.items():
#     print(f"{item}: ${amount:.2f}")

# print("\nTotal: ${:.2f}".format(final_bill))

# ------------------------------------------------------------
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
        return(member_owner_total)
    else:
        print(data)
        return(-1)