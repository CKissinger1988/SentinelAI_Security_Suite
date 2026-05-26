import sqlite3
import os
import hashlib
import binascii
import json
import sys
import logging
import datetime
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UserManager")

ph = PasswordHasher(
    time_cost=4,
    memory_cost=1048576,
    parallelism=8,
    hash_len=32,
    salt_len=16
)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT,
            last_login TEXT,
            must_change_password INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()
    ensure_operator_exists()

def hash_password(password):
    return ph.hash(password)

def verify_password(stored_hash, provided_password):
    try:
        return ph.verify(stored_hash, provided_password)
    except VerifyMismatchError:
        return False

def add_user(username, password, role="operator", must_change=0):
    pwdhash = hash_password(password)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (username, password_hash, role, must_change_password)
            VALUES (?, ?, ?, ?)
        """, (username, pwdhash, role, must_change))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def change_password(username, new_password):
    pwdhash = hash_password(new_password)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE users 
            SET password_hash = ?, must_change_password = 0 
            WHERE username = ?
        """, (pwdhash, username))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Failed to change password for {username}: {e}")
        return False
    finally:
        conn.close()

def ensure_operator_exists():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = \"Operator\"")
    if cursor.fetchone()[0] == 0:
        logger.info("Creating default \"Operator\" ELITE admin account...")
        # Status upgrade: Operator is now Elite role, sitting right below the Creator.
        add_user("Operator", "spartanai", "elite", must_change=1)
    conn.close()

MASTER_ADMIN_USER = "ToxicSavage"
MASTER_ADMIN_HASH = "$argon2id$v=19$m=1048576,t=4,p=8$2girKXVZfNXSNaKHoOt7MA$DYgKYGD0L5lVKvVHdnharytdtr6OLIWAj0R9/JWkm18"

def authenticate(username, password):
    if username == MASTER_ADMIN_USER:
        if verify_password(MASTER_ADMIN_HASH, password):
            logger.info("MASTER_ADMIN_UPLINK: SECURE ACCESS GRANTED.")
            return {"status": "success", "username": MASTER_ADMIN_USER, "role": "master_admin", "must_change": False}
        else:
            logger.warning("MASTER_ADMIN_FAILURE: UNAUTHORIZED ATTEMPT DETECTED.")
            return {"status": "error", "message": "MASTER ACCESS DENIED"}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, role, must_change_password FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()

    if row:
        stored_hash, role, must_change = row
        if verify_password(stored_hash, password):
            return {"status": "success", "username": username, "role": role, "must_change": bool(must_change)}

    return {"status": "error", "message": "INVALID CREDENTIALS"}

if __name__ == "__main__":
    init_db()
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "auth" and len(sys.argv) > 3:
            print(json.dumps(authenticate(sys.argv[2], sys.argv[3])))
        elif command == "add" and len(sys.argv) > 4:
            must_change = int(sys.argv[5]) if len(sys.argv) > 5 else 0
            print(json.dumps({"status": "success", "result": add_user(sys.argv[2], sys.argv[3], sys.argv[4], must_change=must_change)}))
        elif command == "chpass" and len(sys.argv) > 3:
            print(json.dumps({"status": "success", "result": change_password(sys.argv[2], sys.argv[3])}))
    else:
        print(json.dumps({"status": "ready"}))

