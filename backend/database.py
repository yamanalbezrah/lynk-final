from sqlalchemy import create_engine, Column, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Create database engine
DATABASE_URL = "sqlite:///./weather_dashboard.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    
    id = Column(String, primary_key=True, index=True)
    date = Column(String, index=True)
    location = Column(String, index=True)
    notes = Column(Text, nullable=True)
    temperature = Column(Float)
    description = Column(String)
    humidity = Column(Float)
    wind_speed = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 