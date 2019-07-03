#!/usr/bin/env python


from flask import Flask, render_template, request, jsonify, make_response

import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func, distinct
from database import Base, Markers

app = Flask(__name__)
app.secret_key = "super secret key"

engine = create_engine(
    'sqlite:///markers.db',
    connect_args={'check_same_thread': False})
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


@app.route('/')
@app.route('/templates/index/')
def showMap():
    '''Return the only one page of the project'''

    return render_template(
        'index.html')


@app.route('/templates/index/JSON')
def markersJSON():
    '''Return a JSON with all markers saved in the database'''
    markers = session.query(Markers).all()
    markers = [c.serialize for c in markers]
    return jsonify(markers)


@app.route('/templates/save_maker/JSON', methods=['POST'])
def saveMarkers():
    '''This function save data send from application by post method in the database.'''
    try:
        newItem = Markers(
            title=request.form['title'],
            lat=request.form['lat'],
            infoWindow=request.form['info_window'],
            lng=request.form['lng'],
            # this is necessary beacause boolean values are different between
            # javascript and python
            favorite=True if request.form['favorite'] == 'True' else False)
        session.add(newItem)
        session.commit()
        response = make_response(json.dumps('Data saved successfully'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response
    except:
        response = make_response(json.dumps('Invalid state parameter'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response


if __name__ == '__main__':

    app.debug = True
    app.run(host='0.0.0.0', port=5000)
