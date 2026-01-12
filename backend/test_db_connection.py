"""
Postgres connection test.

Usage:
  python test_db_connection.py                    # Reads DATABASE_URL from .env
  DATABASE_URL=postgresql://... python test_db_connection.py

Works both locally and on EC2.
"""
import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set. Set it in backend/.env or as env var.")
    sys.exit(1)

print(f"Using DATABASE_URL: {DATABASE_URL}")

# Prefer psycopg2 for raw connectivity and server version
try:
    import psycopg2
    from psycopg2.extras import DictCursor
except Exception as e:
    print("psycopg2 not installed; install psycopg2-binary in your venv")
    print(e)
    sys.exit(1)


def main():
    start = time.time()
    try:
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
        print("Connected")
        cur = conn.cursor(cursor_factory=DictCursor)
        # Server version
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"Server version: {version}")
        # Simple round trip
        cur.execute("SELECT 1;")
        one = cur.fetchone()[0]
        print(f"Simple query returned: {one}")
        # List databases and current db
        cur.execute("SELECT current_database();")
        current_db = cur.fetchone()[0]
        print(f"Current database: {current_db}")
    except Exception as e:
        print("Connection FAILED")
        print(str(e))
        sys.exit(2)
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass
        print(f"Done in {time.time() - start:.2f}s")


if __name__ == "__main__":
    main()
