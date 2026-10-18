import os
import ipaddress
import socket
from urllib.parse import urlparse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from core.config import settings

def get_aes_gcm():
    master_key = bytes.fromhex(settings.VAULT_MASTER_KEY_HEX)
    return AESGCM(master_key)

def encrypt_vault_secret(plaintext: str) -> str:
    """Encrypts secret using AES-256-GCM. Returns hex(nonce + ciphertext + tag)."""
    aesgcm = get_aes_gcm()
    nonce = os.urandom(12) # 96-bit nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    return (nonce + ciphertext).hex()

def decrypt_vault_secret(encrypted_hex: str) -> str:
    """Decrypts AES-256-GCM ciphertext from hex."""
    aesgcm = get_aes_gcm()
    raw_data = bytes.fromhex(encrypted_hex)
    nonce = raw_data[:12]
    ciphertext = raw_data[12:]
    decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted_bytes.decode('utf-8')

def validate_ssrf_safe_url(target_url: str) -> bool:
    """Validates that a URL does not resolve to private/loopback/cloud-metadata addresses."""
    parsed = urlparse(target_url)
    if parsed.scheme not in ('http', 'https'):
        return False
    hostname = parsed.hostname
    if not hostname:
        return False
    
    # Block localhost keywords
    if hostname.lower() in ('localhost', '127.0.0.1', '::1', '0.0.0.0'):
        return False

    try:
        ip_list = socket.getaddrinfo(hostname, None)
        for item in ip_list:
            ip_str = item[4][0]
            ip_obj = ipaddress.ip_address(ip_str)
            if (
                ip_obj.is_private or
                ip_obj.is_loopback or
                ip_obj.is_link_local or
                ip_obj.is_reserved or
                ip_obj.is_multicast or
                str(ip_obj) == "169.254.169.254" # Cloud metadata IP
            ):
                return False
    except Exception:
        return False
    return True
