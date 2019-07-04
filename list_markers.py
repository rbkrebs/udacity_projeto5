#!/usr/bin/env python
# coding: utf-8
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, Markers


engine = create_engine(
    'sqlite:///markers.db',
    connect_args={'check_same_thread': False})
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

listMarkers = [{'title': 'Legislative Assembly of Rio Grande do Sul', 'lat': '-30.0328', 'infoWindow': 'I really do not like this place!!!', 'lng': '-51.2311', 'favorite': 'False'},
               {'title': 'Marinha do Brasil Park', 'lat': '-30.056944444444', 'infoWindow': 'I have never gone to this places, even living so near',
                   'lng': '-51.232222222222', 'favorite': 'False'},
               {'title': 'Estádio dos Eucaliptos', 'lat': '-30.061666666667', 'infoWindow': 'I do not know anything about this place', 'lng': '-51.227222222222', 'favorite': 'False'},
               {'title': 'Federal University of Health Sciences of Porto Alegre', 'lat': '-30.031576', 'infoWindow': 'I have used to work here for 5 long years!!', 'lng': '-51.220472', 'favorite': 'True'},
               {'title': 'Farroupilha Park', 'lat': '-30.036666666667', 'infoWindow': 'A very good park to practise exercise, but too dangers at night!!', 'lng': '-51.215833333333', 'favorite': 'True'},
               {'title': 'Santa Casa de Misericordia Hospital', 'lat': '-30.0305', 'infoWindow': 'A very important hospital.', 'lng': '-51.2222', 'favorite': 'True'}]

for item in listMarkers:

    newItem = Markers(
        title='{}'.format(item['title']).decode('utf-8'),
        lat='{}'.format(item['lat']),
        infoWindow='{}'.format(item['infoWindow']).decode('utf-8'),
        lng='{}'.format(item['lng']),
        favorite=True if item['favorite'] == 'True' else False)

    session.add(newItem)
    session.commit()
