export interface SSHKey {
  id: string;
  label: string;
  encryptedKey: string;
  createdAt: string;
  uid: string;
}

export const sshKeyService = {
  async addKey(label: string, publicKey: string) {
    // 1. Encrypt key via HSM
    const res = await fetch("/api/security/hsm/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: publicKey }),
    });

    if (!res.ok) throw new Error("HSM_ENCRYPT_FAILED");
    const { encrypted } = await res.json();

    // 2. Store in LocalStorage
    const keys = await this.getKeys();
    const newKey: SSHKey = {
      id: crypto.randomUUID(),
      uid: "guest_operator_01",
      label,
      encryptedKey: encrypted,
      createdAt: new Date().toISOString(),
    };

    keys.push(newKey);
    localStorage.setItem("ssh_keys", JSON.stringify(keys));
    return newKey.id;
  },

  async getKeys(): Promise<SSHKey[]> {
    const keys = localStorage.getItem("ssh_keys");
    return keys ? JSON.parse(keys) : [];
  },

  async deleteKey(keyId: string) {
    const keys = await this.getKeys();
    const filtered = keys.filter((k) => k.id !== keyId);
    localStorage.setItem("ssh_keys", JSON.stringify(filtered));
  },

  async decryptKey(encryptedKey: string): Promise<string> {
    const res = await fetch("/api/security/hsm/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encrypted: encryptedKey }),
    });

    if (!res.ok) throw new Error("HSM_DECRYPT_FAILED");
    const { decrypted } = await res.json();
    return decrypted;
  },
};
