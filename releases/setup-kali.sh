#!/bin/bash
# =========================================================================
#  SPARTANAI SECURITY CORE - KALI NATIVE DESKTOP GUI SETUP SCRIPT
# =========================================================================
# This script configures a full Kali Linux desktop installation to run the
# security suite as a native background service with a local desktop GUI launcher.

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}     SPARTANAI SECURITY CORE - KALI NATIVE SETUP ENGINE${NC}"
echo -e "${CYAN}=========================================================${NC}"

# 1. Root verification
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This setup script must be run with sudo/root privileges.${NC}"
    echo -e "${YELLOW}    sudo bash $0${NC}"
    exit 1
fi

# 2. Identify script and workspace directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
SRC_DIR="$(cd "${SCRIPT_DIR}/.." &>/dev/null && pwd)"
BINARY_PATH="${SCRIPT_DIR}/react-example-linux"
INSTALL_BIN="/usr/local/bin/spartanai-security-core"

# 3. Update repositories and install native Kali/desktop dependencies
echo -e "${YELLOW}[*] Installing system dependencies, GUI browser, and Kali security tools...${NC}"
apt-get update -y || true
apt-get install -y nmap git curl android-tools-adb chromium x11-utils net-cat-openbsd daemonize \
    metasploit-framework kali-tools-top10 || true

# 3.5 Initialize and prepare Metasploit database out-of-the-box
echo -e "${YELLOW}[*] Setting up Metasploit database environment...${NC}"
if command -v msfdb &> /dev/null; then
    # Initialize the MSF database if it hasn't been initialized yet
    msfdb init --non-interactive || echo -e "${YELLOW}[!] Metasploit database initialization skipped or already active.${NC}"
else
    echo -e "${RED}[!] msfdb helper not found. Skipping database initialization.${NC}"
fi

# 4. Install backend executable or source wrapper
if [ -f "$BINARY_PATH" ]; then
    echo -e "${GREEN}[*] Installing standalone executable to ${INSTALL_BIN}...${NC}"
    cp "$BINARY_PATH" "$INSTALL_BIN"
    chmod +x "$INSTALL_BIN"
else
    echo -e "${YELLOW}[!] Standalone binary not found. Creating source boot wrapper...${NC}"
    cat <<EOF > "$INSTALL_BIN"
#!/bin/bash
export NODE_ENV=production
export PORT=3000
cd "${SRC_DIR}"
exec node dist/server.cjs
EOF
    chmod +x "$INSTALL_BIN"
fi

# 5. Create backend daemon Systemd service
SERVICE_PATH="/etc/systemd/system/spartanai-security-core.service"
echo -e "${YELLOW}[*] Configuring background service daemon: ${SERVICE_PATH}...${NC}"
cat <<EOF > "$SERVICE_PATH"
[Unit]
Description=SpartanAI Security Core Service
After=network.target

[Service]
Type=simple
ExecStart=$INSTALL_BIN
Restart=always
RestartSec=5
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable and start backend service
echo -e "${YELLOW}[*] Activating system startup hooks...${NC}"
systemctl daemon-reload
systemctl enable spartanai-security-core.service || true
systemctl restart spartanai-security-core.service || true

# 6. Create Desktop GUI Launcher and Autostart integration
LAUNCHER_BIN="/usr/local/bin/spartanai-security-core-gui-launch"
echo -e "${YELLOW}[*] Creating desktop GUI launcher helper: ${LAUNCHER_BIN}...${NC}"
cat <<'EOF' > "$LAUNCHER_BIN"
#!/bin/bash
# Wait for the backend port to open
echo "[*] Waiting for SpartanAI Security Core backend to initialize..."
for i in {1..30}; do
    if nc -z localhost 3000; then
        break
    fi
    sleep 1
done

# Launch browser in kiosk/app mode
if command -v chromium &> /dev/null; then
    exec chromium --app=http://localhost:3000 --start-maximized --no-first-run --no-sandbox
elif command -v firefox &> /dev/null; then
    exec firefox --new-window http://localhost:3000
else
    echo "[!] No suitable web browser found to load GUI."
fi
EOF
chmod +x "$LAUNCHER_BIN"

# Create .desktop file for system applications menu
DESKTOP_FILE="/usr/share/applications/spartanai-security-core.desktop"
echo -e "${YELLOW}[*] Creating desktop application menu shortcut: ${DESKTOP_FILE}...${NC}"
cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=SpartanAI Security Core
Comment=Autonomous AI Pentest & Security Command Center
Exec=$LAUNCHER_BIN
Icon=security-high
Terminal=false
Type=Application
Categories=Network;Security;
EOF
chmod +x "$DESKTOP_FILE"

# Create autostart hook for desktop sessions
AUTOSTART_DIR="/etc/xdg/autostart"
mkdir -p "$AUTOSTART_DIR"
cp "$DESKTOP_FILE" "${AUTOSTART_DIR}/spartanai-security-core.desktop"
echo -e "${GREEN}[+] Autostart launcher registered in ${AUTOSTART_DIR}/spartanai-security-core.desktop${NC}"

# 7. Auto-provision Cloudflare Tunnel
TUNNEL_SETUP_SCRIPT="${SRC_DIR}/setup-cloudflare-tunnel.sh"
if [ -f "$TUNNEL_SETUP_SCRIPT" ]; then
    echo -e "${YELLOW}[*] Auto-running Cloudflare Tunnel setup...${NC}"
    bash "$TUNNEL_SETUP_SCRIPT" || echo -e "${RED}[!] Cloudflare Tunnel setup failed or skipped.${NC}"
fi

echo -e "${CYAN}=========================================================${NC}"
echo -e "${GREEN}[+] NATIVE KALI DESKTOP INSTALLATION COMPLETE!${NC}"
echo -e "${GREEN}    -> Background Service: Running on http://localhost:3000/${NC}"
echo -e "${GREEN}    -> GUI Desktop App:   Registered under Applications Menu${NC}"
echo -e "${GREEN}    -> Autostart Hook:    Active on login${NC}"
echo -e "${CYAN}=========================================================${NC}"
