from BeautifulSoup import BeautifulSoup
import json
from collections import defaultdict
import pymongo

with open('./learnCode/packages/npm-container/.npm/package/node_modules/wappalyzer/apps.json', 'rb') as json_doc:
    json_string = json.load(json_doc)

all_app_terms = set()

for app in json_string['apps'].keys():
    app_text = app.lower()
    app_text = app_text.split()
    for app_item in app_text:
        if 'js' in app_item:
            app_items = app_item.split('js')
            for app_i in app_items:
                if len(app_i) > 1:
                    all_app_terms.add(app_i)
        all_app_terms.add(app_item)

with open('ps-htmlstring.html', 'rb') as html_string:
    soup = BeautifulSoup(html_string)

relevant_courses = defaultdict(list)

for course_result in soup.findAll('div', {'class': 'search-result columns'}):
    course_title = course_result.find('a').text
    course_level = course_result.find('div', {'class': 'search-result__level'}).text
    course_date = course_result.find('div', {'class': 'search-result__date'}).text
    course_length = course_result.find('div', {'class': 'search-result__length show-for-large-up'}).text
    course_link = course_result.find('a').attrs[0][1]

    ratings = course_result.find('div', {'class':"search-result__rating show-for-xlarge-up"}).text
    ratings = ratings.replace("(", "")
    ratings = ratings.replace(")", "")

    course_rating_out_of_5 = 5 - len(course_result.findAll('i', {'class': 'fa fa-star gray'}))

#     if '2015' in course_date or '2016' in course_date:
    if course_level in {'Beginner', 'Intermediate'}:
        if course_rating_out_of_5 >= 4:
            course_name = set(course_title.lower().split(" "))

            categories = set()
            for app_term in all_app_terms:
                if len(app_term) > 1:
                    if app_term in course_name:
                        categories.add(app_term)

            if len(categories) > 0:

                course_info = {
                    'course_title': course_title,
                    'course_level': course_level,
                    'course_length': course_length,
                    'course_date': course_date,
                    'categories': list(categories),
                    'course_rating': course_rating_out_of_5,
                    'course_link': course_link,
                    'num_ratings': ratings
                }

                for category in categories:
                    relevant_courses[category].append(course_info)


client = pymongo.MongoClient(host="127.0.0.1", port=3001)
meteordb = client['meteor']
lessons_coll = meteordb['lessons']

for course_cat, relevant_cs in relevant_courses.iteritems():
    lessons_coll.insert({'courseCategory': course_cat, 'courseInfo': relevant_cs})