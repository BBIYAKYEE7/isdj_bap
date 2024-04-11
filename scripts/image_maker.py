import requests
from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime

def loadfont(fontsize):
    ttf = 'assets/fonts/SUIT-Bold.ttf'
    return ImageFont.truetype(font=ttf, size=fontsize)

weekdays = ['월', '화', '수', '목', '금']

def school_meal(meals, date, weekday):
    W = 1080
    H = 2700

    meals = reversed(meals)

    date_font = loadfont(150)
    date_font_color = 'rgb(196, 196, 196)'

    image = Image.open('assets/images/food_background.png')
    draw = ImageDraw.Draw(image)

    parsed_day = date.split('-')
    text = f'{parsed_day[0]}년 {parsed_day[1]}월 {parsed_day[2]}일 {weekdays[weekday]}요일'
    draw.text((2240, 800), text, font=date_font, fill=date_font_color, align='right')

    meal_font = loadfont(180)
    meal_font_color = '#333333'

    text_l = 0

    for meal in meals:
        print(meal)
        draw.text((500, H - 10 - text_l), meal, font=meal_font, fill=meal_font_color)
        text_l += 220

    image.convert('RGB').save('./build/meal.jpeg', format='JPEG', quality=95)

def fetch_meal_from_neis(API_KEY, SCHOOL_CODE, SCHOOL_TYPE):
    today = datetime.today().strftime('%Y%m%d')
    url = f"https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&KEY={API_KEY}&ATPT_OFCDC_SC_CODE={SCHOOL_TYPE}&SD_SCHUL_CODE={SCHOOL_CODE}&MLSV_YMD={today}"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        try:
            meals = data['mealServiceDietInfo'][1]['row'][0]['DDISH_NM'].split('<br/>')
            date = datetime.today().strftime('%Y-%m-%d')
            school_meal(meals, date, datetime.today().weekday())
        except (IndexError, KeyError):
            print("급식 정보를 찾을 수 없습니다.")
    else:
        print(f"API 요청 실패: {response.status_code}")

def main():
    API_KEY = 'c3a65dc6054443bca5998d5cc2800a7d'
    SCHOOL_CODE = '7530203'
    SCHOOL_TYPE = 'J10'

    if not os.path.exists('./build/'):
        os.makedirs('./build/')
    fetch_meal_from_neis(API_KEY, SCHOOL_CODE, SCHOOL_TYPE)

main()
