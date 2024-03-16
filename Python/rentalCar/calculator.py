from rentalCar.modo import modo_calculator
import datetime
import requests
from pytz import timezone
import datetime
import requests
from pytz import timezone
from flask import request

EVO_DAILY_COST = 104.99
EVO_HOURLY_COST = 17.99
EVO_COST_THRESHOLD = EVO_DAILY_COST / EVO_HOURLY_COST
RENTAL_PER_DAY_RATE = 60
MODO_PER_DAY_RATE = 90
KM_COST = 0.10
TIME_FORMAT = "%Y-%m-%d-%H-%M-%S"
TIMEZONE = 'America/Vancouver'
TIME_API_URL = "http://worldtimeapi.org/api/timezone/America/Vancouver"


def evo_calculator(hours):
    total_full_day, remaining_hours = divmod(hours, 24)
    if remaining_hours >= EVO_COST_THRESHOLD:
        total_full_day += 1
        remaining_hours = 0
    total_cost = total_full_day * EVO_DAILY_COST + remaining_hours * EVO_HOURLY_COST
    if (total_full_day > 0):
        total_cost += 1.5  # PVRT
    total_cost += 1.25  # One time fee
    total_cost = total_cost * 1.12  # Tax
    return total_cost


def rental_calculator(hours, kms):
    total_full_day, remaining_hours = divmod(hours, 24)
    total_day_cost = (total_full_day + bool(remaining_hours)
                      ) * RENTAL_PER_DAY_RATE
    total_km_cost = kms * KM_COST
    total_cost = total_day_cost + total_km_cost
    return total_cost


def hours_calculator(start, end):
    start_time = datetime.datetime.strptime(start, TIME_FORMAT)
    end_time = datetime.datetime.strptime(end, TIME_FORMAT)
    current_time = get_current_time()
    start_time = start_time.replace(tzinfo=timezone(TIMEZONE))
    end_time = end_time.replace(tzinfo=timezone(TIMEZONE))
    if start_time > end_time:
        return -1
    if start_time < current_time or end_time < current_time:
        print({"start": start_time, "end": end_time, "current": current_time})
        return -2
    difference = end_time - start_time
    total_hours = difference.total_seconds() / 3600
    return total_hours


def get_current_time():
    try:
        response = requests.get(TIME_API_URL)
        data = response.json()
        current_time = data.get("datetime", None)
        return datetime.datetime.fromisoformat(current_time)
    except Exception as e:
        return datetime.datetime.now()


def total_price_calculator():
    start = request.args.get('start')
    end = request.args.get('end')
    kms = request.args.get('kms')
    if not all([start, end, kms]):
        return "Error with start, end, or kms"
    try:
        hours = hours_calculator(start, end)
        if hours <= 0:
            return "Error with start and end dates: "+str(hours)
        kms = float(kms)
        if kms <= 0:
            return "Error with kms"
    except Exception as e:
        return "Error with start and end dates: "+str(e)
    evo_total = str(round(evo_calculator(hours), 2))
    modo_total = str(round(modo_calculator(start, end, kms), 2))
    rental_total = str(round(rental_calculator(hours, kms), 2))
    final = ""
    final += "Evo: $"+evo_total+"<br/>"
    final += "Modo: $"+modo_total+"<br/>"
    final += "Rental: $"+rental_total+"<br/>"
    return final
