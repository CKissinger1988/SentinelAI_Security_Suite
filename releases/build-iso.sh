#!/bin/bash
# =========================================================================
#  SPARTANAI SECURITY CORE - CUSTOM LIVE ISO GENERATOR
# =========================================================================
# This script uses 'live-build' to compile a custom, bootable Debian-based
# Live OS ISO that includes the SpartanAI Security Core pre-installed and
# configured to run on startup with persistence enabled.
#
# RUNTIME REQUIREMENTS:
# - A native Debian/Ubuntu or Kali Linux system (or WSL2 with custom kernel/loop devices enabled).
# - Root privileges (sudo).
#
# Optional Environment Variables:
# GITHUB_RELEASE=true  - Set to true to automatically push the ISO to GitHub Releases.
# VERSION_TAG=v2.5.0   - The version tag to use for the release.
#
# Usage: sudo bash build-iso.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================================${NC}"
echo -e "${CYAN}        SPARTANAI SECURITY CORE - CUSTOM LIVE ISO COMPILER${NC}"
echo -e "${CYAN}=========================================================${NC}"

# 1. Root check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Error: This build script must be run as root (sudo).${NC}"
    exit 1
fi

# 2. Package Dependency Checks
echo -e "${YELLOW}[*] Installing live-build and compilation tools...${NC}"
apt-get update -y || true # Add || true to prevent script from failing if update fails
apt-get install -y live-build xorriso squashfs-tools curl git daemonize debootstrap gh nodejs npm kali-archive-keyring # Removed qemu-system-x86 as not needed for Kali install

# 3. Handle WSL2 loop device constraint
# live-build requires loop devices (/dev/loop0, etc.) to construct disk images.
# In many WSL2 environments, these device nodes do not exist by default.
if grep -qis "microsoft" /proc/version || grep -qis "wsl" /proc/version; then
    echo -e "${YELLOW}[*] WSL2 environment detected. Verifying loop device nodes...${NC}"
    if [ ! -b /dev/loop0 ]; then
        echo -e "${YELLOW}[*] Creating loop device nodes in WSL...${NC}"
        for i in {0..7}; do
            if [ ! -b "/dev/loop$i" ]; then
                mknod "/dev/loop$i" b 7 "$i" || true
            fi
        done
        echo -e "${GREEN}[+] Loop device nodes created successfully.${NC}"
    fi
fi

# 4. Set up clean build workspace
BUILD_WORKSPACE="/opt/spartanai-security-core-iso-build"
echo -e "${YELLOW}[*] Creating clean workspace: ${BUILD_WORKSPACE}${NC}"
rm -rf "$BUILD_WORKSPACE"
mkdir -p "$BUILD_WORKSPACE"
cd "$BUILD_WORKSPACE"

# 4.5 Generate Preseed Configuration for Zero-Touch Installation
echo -e "${YELLOW}[*] Generating Preseed automation file (preseed.cfg)...${NC}"
cat <<EOF > preseed.cfg
# Locale & Keyboard
d-i debian-installer/locale string en_US
d-i keyboard-configuration/xkb-keymap select us

# Network Configuration
d-i netcfg/choose_interface select auto
d-i netcfg/get_hostname string spartanai-security-core-node
d-i netcfg/get_domain string sovereign.local
d-i netcfg/wireless_wep string

# Mirror Settings
d-i mirror/country string US
d-i mirror/http/hostname string http.kali.org
d-i mirror/http/directory string /kali
d-i mirror/http/proxy string

# Account Setup (Sovereign Operator)
d-i passwd/root-login boolean true
d-i passwd/make-user boolean true
d-i passwd/user-fullname string SpartanAI Security Core Operator
d-i passwd/username string operator
d-i passwd/user-password password spartanai2024
d-i passwd/user-password-again password spartanai2024
d-i user-setup/allow-password-weak boolean true

# Partitioning (Full Disk - GPT/UEFI Compatibility)
d-i partman-auto/disk string /dev/sda
d-i partman-auto/method string regular
d-i partman-partitioning/choose_label select gpt # Corrected syntax
d-i partman-partitioning/default_label select gpt # Corrected syntax
d-i partman-lvm/device_remove_lvm boolean true
d-i partman-md/device_remove_md boolean true
d-i partman-auto/choose_recipe select atomic
d-i partman-efi/non_efi_system boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true

# Package Selection & Grub
tasksel tasksel/first multiselect standard
d-i pkgsel/include string openssh-server build-essential nvidia-driver firmware-misc-nonfree nvidia-cuda-toolkit kali-linux-large android-tools-adb # Added android-tools-adb
d-i apt-setup/non-free boolean true
d-i apt-setup/contrib boolean true
d-i grub-installer/only_debian boolean false # Kali is not Debian branded
d-i grub-installer/with_other_os boolean false
d-i grub-installer/bootdev  string default

# Finalization
d-i finish-install/reboot_in_progress note
EOF

# 5. Initialize live-build configuration
echo -e "${YELLOW}[*] Initializing live-build structure...${NC}"
lb config \
    --binary-images iso-hybrid \
    --distribution kali-rolling \
    --archive-areas "main contrib non-free" \
    --mirror-bootstrap "http://kali.download/kali" \
    --mirror-chroot "http://kali.download/kali" \
    --mirror-binary "http://kali.download/kali" \
    --bootstrap-keyring kali-archive-keyring \
    --debian-installer live \
    --debian-installer-preseed preseed.cfg \
    --apt-recommends false \
    --security false \
    --volatile false \
    --linux-packages "linux-image" \
    --linux-flavours amd64

# Add packages to list
mkdir -p config/package-lists
cat <<EOF > config/package-lists/spartanai-security-core.list.chroot
nodejs
npm
debian-installer-launcher
kali-linux-large
android-tools-adb
EOF

# 6. Add Custom Files & Binary Overlay
echo -e "${YELLOW}[*] Overlaying SpartanAI Security Core into Live filesystem...${NC}"
CHROOT_OVERLAY="config/includes.chroot"
mkdir -p "${CHROOT_OVERLAY}/usr/local/bin"
mkdir -p "${CHROOT_OVERLAY}/etc/systemd/system"

# Set project root
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." &>/dev/null && pwd)"

# Build the Node.js application first
echo -e "${GREEN}[*] Building Node.js application...${NC}"
npm install --prefix "${PROJECT_ROOT}"
npm run build --prefix "${PROJECT_ROOT}"

# Copy the built Node.js application
echo -e "${GREEN}[*] Provisioning SpartanAI Security Core application into overlay...${NC}"
mkdir -p "${CHROOT_OVERLAY}/opt/spartanai-security-core"
cp -r "${PROJECT_ROOT}/dist" "${CHROOT_OVERLAY}/opt/spartanai-security-core/dist"
cp "${PROJECT_ROOT}/package.json" "${CHROOT_OVERLAY}/opt/spartanai-security-core/package.json"
cp "${PROJECT_ROOT}/package-lock.json" "${CHROOT_OVERLAY}/opt/spartanai-security-core/package-lock.json" || true

cat <<'EOF' > "${CHROOT_OVERLAY}/usr/local/bin/spartanai-security-core"
#!/bin/bash
echo "[*] Launching SpartanAI Security Core in Live OS..."
export NODE_ENV=production
export PORT=3000
cd /opt/spartanai-security-core
exec node dist/server.cjs
EOF
    chmod +x "${CHROOT_OVERLAY}/usr/local/bin/spartanai-security-core"

# 7. Configure systemd service inside chroot to launch console on boot
cat <<EOF > "${CHROOT_OVERLAY}/etc/systemd/system/spartanai-security-core.service"
[Unit]
Description=SpartanAI Security Core Live Daemon
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/spartanai-security-core
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 8. Hook systemd service activation in chroot boot stages
mkdir -p config/hooks/normal
cat <<'EOF' > config/hooks/normal/0990-enable-spartanai-security-core-service.hook.chroot
#!/bin/sh
systemctl enable spartanai-security-core.service || true
EOF
chmod +x config/hooks/normal/0990-enable-spartanai-security-core-service.hook.chroot

# 8.05 Install production dependencies inside chroot
cat <<'EOF' > config/hooks/normal/0990-install-deps.hook.chroot
#!/bin/sh
cd /opt/spartanai-security-core
npm install --production --no-audit --no-fund
EOF
chmod +x config/hooks/normal/0990-install-deps.hook.chroot

# 8.06 Set GRUB timeout to 1 second for faster automated testing
cat <<'EOF' > config/hooks/normal/0990-set-grub-timeout.hook.chroot
#!/bin/sh
echo "[*] Setting GRUB timeout to 1 second for automated boot..."
sed -i 's/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=1/' /etc/default/grub
update-grub
EOF
chmod +x config/hooks/normal/0990-set-grub-timeout.hook.chroot

# 9. Trigger Live OS ISO Build Compilation
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}[+] BUILD CONFIGURATION STAGED SUCCESSFULLY!${NC}"
echo -e "${YELLOW}[*] Launching live-build compilation. This may take several minutes...${NC}"
echo -e "${CYAN}=========================================================${NC}"

# Run the build
lb build

# Move compiled ISO output back to releases folder
if [ -f "live-image-amd64.hybrid.iso" ]; then
    cp "live-image-amd64.hybrid.iso" "${SCRIPT_DIR}/spartanai-live-security.iso"
    echo -e "${GREEN}[+] ISO COMPILATION SUCCESSFUL!${NC}"
    echo -e "${GREEN}    -> Output: ${SCRIPT_DIR}/spartanai-live-security.iso${NC}"

    # 10. Optional GitHub Release Integration
    if [ "$GITHUB_RELEASE" = "true" ]; then
        TAG=${VERSION_TAG:-"v$(date +%Y.%m.%d)"}
        echo -e "${CYAN}[*] Pushing to GitHub Releases with tag ${TAG}...${NC}"
        if command -v gh &> /dev/null; then
            gh release create "$TAG" "${SCRIPT_DIR}/spartanai-live-security.iso" \
                --title "SpartanAI Security Core $TAG" \
                --notes "Automated Sovereign Live ISO build for deployment and testing."
            echo -e "${GREEN}[+] Release $TAG pushed successfully.${NC}"
        else
            echo -e "${RED}[!] gh CLI not found or not authenticated. Skipping release.${NC}"
        fi
    fi

    # 11. Live Testing Instructions
    echo -e "${CYAN}=========================================================${NC}"
    echo -e "${GREEN}[+] ISO READY FOR LIVE TESTING${NC}"
    echo -e "${YELLOW}[*] To boot the ISO in WSL via QEMU (with port forwarding), run:${NC}"
    echo -e "${CYAN}    qemu-system-x86_64 -m 2048 -cdrom ${SCRIPT_DIR}/spartanai-live-security.iso -net nic -net user,hostfwd=tcp::3000-:3000${NC}"
    echo -e "${YELLOW}[*] Once booted, access the dashboard at: http://localhost:3000${NC}"
    echo -e "${CYAN}=========================================================${NC}"

else
    echo -e "${RED}[!] ISO Compilation failed. Please review chroot log files above.${NC}"
    exit 1
fi
