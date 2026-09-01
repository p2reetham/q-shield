"""
Cryptographic primitives used across Q-SHIELD.

IMPORTANT (technical honesty): this module implements *classical* digital
signatures (RSA-PSS over SHA-256) for the demonstration signing/verification
flow, and SHA-256 hashing for the blockchain ledger. Nothing here runs on a
quantum computer, and nothing here should be read as a certified,
production-grade cryptographic implementation -- it is a working prototype
suitable for an SIH demo, built with real, standard-library-backed crypto
(the `cryptography` package) rather than placeholder/fake hashing.
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timezone

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def generate_rsa_keypair(key_size: int = 2048):
    """Generate an RSA keypair for demonstration signing. Returns (private_pem, public_pem)."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return private_pem, public_pem


def sign_bytes(private_pem: str, payload: bytes) -> str:
    private_key = serialization.load_pem_private_key(private_pem.encode(), password=None)
    signature = private_key.sign(
        payload,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256(),
    )
    return signature.hex()


def verify_bytes(public_pem: str, payload: bytes, signature_hex: str) -> bool:
    try:
        public_key = serialization.load_pem_public_key(public_pem.encode())
        public_key.verify(
            bytes.fromhex(signature_hex),
            payload,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
        return True
    except Exception:
        return False


def random_session_id() -> str:
    return secrets.token_hex(8)
