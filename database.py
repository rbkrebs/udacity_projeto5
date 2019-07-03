#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy import create_engine

Base = declarative_base()


class Markers(Base):
    """docstring for Markers"""

    __tablename__ = 'markers'

    lat = Column(String(20), nullable=False)
    lng = Column(String(20), nullable=False)
    title = Column(String(20), nullable=False)
    infoWindow = Column(String(80), nullable=False)
    favorite = Column(Boolean(5), nullable=False, default=False)
    id = Column(Integer, primary_key=True)

    # To send JSON objects in a serializable format
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'title': self.title,
            'lat': self.lat,
            'lng': self.lng,
            'info_window': self.infoWindow,
            'favorite': self.favorite

        }


engine = create_engine('sqlite:///markers.db', encoding='utf-8')

Base.metadata.create_all(engine)
