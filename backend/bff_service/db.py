import mysql.connector
import hashlib
import os

class Database:
    CONNECTION_CONFIG = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'app'
    }
    
    @staticmethod
    def connect_to_database():
        try:
            conn = mysql.connector.connect(**Database.CONNECTION_CONFIG)
            return conn
        except Exception as e:
            print(e)
           
    @staticmethod 
    def hash_password(password: str):
        salt = os.urandom(16)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return salt.hex() + ":" + dk.hex()

    @staticmethod
    def add_user(name: str, email: str, password: str):
        conn = Database.connect_to_database()
        if not conn:
            return None

        try:
            cursor = conn.cursor()
            password_hash = Database.hash_password(password)

            query = """
                INSERT INTO user (name, email, password_hash)
                VALUES (%s, %s, %s)
            """

            cursor.execute(query, (name, email, password_hash))
            conn.commit()

            return {
                "id": cursor.lastrowid,
                "name": name,
                "email": email,
                "role": 1
            }
        except Exception as e:
            print(e)
            return None
        finally:
            cursor.close()
            conn.close()
            
    @staticmethod
    def get_user_by_email(email: str):
        conn = Database.connect_to_database()
        if not conn:
            return None

        try:
            cursor = conn.cursor()

            query = """
                SELECT id, name, email, password_hash, role
                FROM user
                WHERE email = %s
            """

            cursor.execute(query, (email,))
            row = cursor.fetchone()

            if not row:
                return None

            keys = [
                "id", "name", "email", "password_hash", "role"
            ]

            return dict(zip(keys, row))

        except Exception as e:
            print(e)
            return None

        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def _verify_password(stored: str, password: str) -> bool:
        try:
            salt_hex, dk_hex = stored.split(":")
        except Exception:
            return False
        salt = bytes.fromhex(salt_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return dk.hex() == dk_hex