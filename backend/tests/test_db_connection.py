import os
import psycopg2
from dotenv import load_dotenv

def test_connection():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("DATABASE_URL not found in .env file")
        return

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print("Connected successfully")
        print("PostgreSQL version:", version[0])
        cur.close()
        conn.close()
    except Exception as e:
        print("Connection failed")
        print("Error:", e)

if __name__ == "__main__":
    test_connection()

