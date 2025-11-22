import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from app.core.config import settings
from urllib.parse import urlparse
import sys

def create_database():
    db_url = settings.DATABASE_URL
    if "sqlite" in db_url:
        print("Using SQLite, no need to create database manually.")
        return

    try:
        url = urlparse(db_url)
        username = url.username
        password = url.password
        host = url.hostname
        port = url.port
        db_name = url.path[1:]
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        return

    print(f"Connecting to PostgreSQL at {host}...")
    
    # Connect to default 'postgres' database to create the new one
    try:
        con = psycopg2.connect(dbname='postgres', user=username, host=host, password=password, port=port)
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database '{db_name}'...")
            cur.execute(f"CREATE DATABASE {db_name}")
            print("Database created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
            
        cur.close()
        con.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please ensure PostgreSQL is running and credentials in app/core/config.py are correct.")

if __name__ == "__main__":
    create_database()
