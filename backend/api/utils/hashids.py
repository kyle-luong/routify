from hashids import Hashids
import os
from dotenv import load_dotenv

load_dotenv()

salt = os.environ.get("HASHID_SALT")
hashids = Hashids(min_length=6, salt=salt)

def encode_id(num):
    return hashids.encode(num)

def decode_id(hashid):
    decoded = hashids.decode(hashid)
    return decoded[0] if decoded else None
