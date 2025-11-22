import psycopg2
from urllib.parse import urlparse
import sys

def check_connection():
    # Common passwords to try
    passwords = ['password', 'postgres', 'admin', 'root', '123456', '']
    user = 'postgres'
    host = 'localhost'
    port = '5432'
    dbname = 'postgres'

    print(f"Attempting to connect to PostgreSQL at {host}:{port}...")

    for pwd in passwords:
        masked_pwd = pwd if pwd else "(empty)"
        print(f"Trying password: '{masked_pwd}' ... ", end='')
        try:
            conn = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=pwd,
                host=host,
                port=port
            )
            print("SUCCESS!")
            print(f"\nValid credentials found:\nUser: {user}\nPassword: {masked_pwd}")
            print(f"\nPlease update your backend/.env file with this password.")
            conn.close()
            return
        except psycopg2.OperationalError as e:
            print("Failed.")
            # print(f"Error: {e}") # Uncomment for verbose error

    print("\nCould not connect with common passwords.")
    print("Please ensure PostgreSQL is running and you know the password for the 'postgres' user.")

if __name__ == "__main__":
    check_connection()
