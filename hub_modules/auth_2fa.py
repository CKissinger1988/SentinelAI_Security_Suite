import pyotp
import os
import json

SECRET_FILE = os.path.join(os.path.dirname(__file__), '.2fa_secret')

def get_or_create_secret():
    """Retrieves the existing TOTP secret or generates a new one."""
    if os.path.exists(SECRET_FILE):
        with open(SECRET_FILE, 'r') as f:
            return f.read().strip()
    
    new_secret = pyotp.random_base32()
    with open(SECRET_FILE, 'w') as f:
        f.write(new_secret)
    
    # Also save a human-readable setup info (NOT committed)
    setup_info = {
        "secret": new_secret,
        "provisioning_uri": pyotp.totp.TOTP(new_secret).provisioning_uri(
            name="SpartanAI", 
            issuer_name="Jarvis-HUB"
        )
    }
    with open("2FA_SETUP.json", "w") as f:
        json.dump(setup_info, f, indent=4)
        
    return new_secret

def verify_token(token):
    """Verifies a 6-digit TOTP token."""
    secret = get_or_create_secret()
    totp = pyotp.TOTP(secret)
    return totp.verify(token)

if __name__ == "__main__":
    secret = get_or_create_secret()
    print(f"2FA SYSTEM INITIALIZED. SECRET SAVED TO .2fa_secret")
    print(f"OPEN 2FA_SETUP.json TO CONFIGURE YOUR AUTHENTICATOR APP.")
