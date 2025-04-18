from pymongo import ASCENDING
from werkzeug.security import generate_password_hash, check_password_hash

def create_user_indexes(collection):
    # Ensure email is unique
    collection.create_index([("email", ASCENDING)], unique=True)

def hash_password(password):
    return generate_password_hash(password)

def verify_password(stored_password, input_password):
    return check_password_hash(stored_password, input_password)

def get_user_dict(name, email, password):
    return {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "created_at": datetime.utcnow()
    }
