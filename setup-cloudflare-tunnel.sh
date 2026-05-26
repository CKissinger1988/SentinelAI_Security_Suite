#!/bin/bash
# =========================================================================
#  SPARTANAI SECURITY CORE SUITE - CLOUDFLARE TUNNEL AUTO-PROVISIONING
# =========================================================================
# This script automates the creation of a secure global tunnel for the suite.

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}[*] SpartanAI_Security_Core: Initiating Global Gateway Provisioning...${NC}"

# 1. Check/Install cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}[!] cloudflared not found. Installing...${NC}"
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
fi

# 2. Login
echo -e "${CYAN}[*] Please follow the URL in your browser to authorize SpartanAI_Security_Core:${NC}"
cloudflared tunnel login

# 3. Create Tunnel
TUNNEL_NAME="spartanai-security-core-sovereign-tunnel"
echo -e "${CYAN}[*] Creating tunnel: ${TUNNEL_NAME}${NC}"
cloudflared tunnel create $TUNNEL_NAME || echo "Tunnel already exists."

# 4. Generate Configuration
mkdir -p ~/.cloudflared
CONFIG_FILE="$HOME/.cloudflared/config.yml"
TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')

cat <<EOF > $CONFIG_FILE
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: spartanai-security-core.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

echo -e "${GREEN}[+] Configuration generated at $CONFIG_FILE${NC}"
echo -e "${YELLOW}[!] Action Required: Update 'spartanai-security-core.your-domain.com' in the config file to your actual domain.${NC}"

# 5. Route DNS
echo -e "${CYAN}[*] Attempting to route DNS (Ensure you have a domain managed by CF)...${NC}"
echo "Usage: cloudflared tunnel route dns $TUNNEL_NAME <your-subdomain>"

# 6. Install as Service
echo -e "${CYAN}[*] Installing tunnel as a system daemon...${NC}"
sudo cloudflared --config $CONFIG_FILE service install

echo -e "${CYAN}=========================================================${NC}"
echo -e "${GREEN}[+] GLOBAL GATEWAY ESTABLISHED${NC}"
echo -e "${GREEN}    Tunnel ID: $TUNNEL_ID${NC}"
echo -e "${GREEN}    Local Service: http://localhost:3000${NC}"
echo -e "${GREEN}    Command: sudo systemctl start cloudflared${NC}"
echo -e "${CYAN}=========================================================${NC}"