export interface SSHKey {
  id: string;
  userId: string;
  label: string;
  encryptedKey: string;
  createdAt: string;
}

// New interface for uploaded files
export interface UploadedFile {
  id: string;
  user: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'system' | 'banner' | 'info' | 'prompt' | 'success' | 'meterpreter';
  timestamp: string;
}

export interface TrainingMetric {
  epoch: number;
  accuracy: number;
  loss: number;
}

export interface TerminalMessage {
  id: string;
  type: string;
  content: string;
  timestamp?: string;
  host?: string;
  user?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  active: boolean;
  version: string;
  status: string;
  health: number;
  tags: string[];
}

export interface ScanResult {
  id: string;
  target: string;
  timestamp: string;
  status: string;
  findings: string[];
  results?: any;
}
