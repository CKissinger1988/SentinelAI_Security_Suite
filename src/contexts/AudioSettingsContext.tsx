import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";

interface AudioSettingsContextType {
  inputDevices: MediaDeviceInfo[];
  outputDevices: MediaDeviceInfo[];
  selectedInput: string;
  setSelectedInput: (deviceId: string) => void;
  selectedOutput: string;
  setSelectedOutput: (deviceId: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  wakeWordSensitivity: number;
  setWakeWordSensitivity: (value: number) => void;
  allowWakeWordBypassOnCritical: boolean;
  setAllowWakeWordBypassOnCritical: (value: boolean) => void;
  refreshDevices: () => Promise<void>;
}

const AudioSettingsContext = createContext<
  AudioSettingsContextType | undefined
>(undefined);

export const AudioSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>(
    localStorage.getItem("selectedInputDevice") || "",
  );
  const [selectedOutput, setSelectedOutput] = useState<string>(
    localStorage.getItem("selectedOutputDevice") || "",
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(
    localStorage.getItem("selectedJarvisVoice") || "Puck",
  );
  const [wakeWordSensitivity, setWakeWordSensitivity] = useState<number>(
    Number(
      localStorage.getItem("spartanai_security_core_jarvis_sensitivity"),
    ) || 50,
  );
  const [allowWakeWordBypassOnCritical, setAllowWakeWordBypassOnCritical] =
    useState<boolean>(
      localStorage.getItem("spartanai_security_core_jarvis_bypass_critical") ===
        "true",
    );

  const refreshDevices = useCallback(async () => {
    try {
      // Request microphone permission first to ensure labels are available
      // This might trigger a browser prompt if not already granted
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setInputDevices(inputs);
      setOutputDevices(outputs);

      // Auto-select first if none selected or previously selected device is no longer available
      if (!selectedInput || !inputs.some((d) => d.deviceId === selectedInput)) {
        setSelectedInput(inputs.length > 0 ? inputs[0].deviceId : "");
      }
      if (
        !selectedOutput ||
        !outputs.some((d) => d.deviceId === selectedOutput)
      ) {
        setSelectedOutput(outputs.length > 0 ? outputs[0].deviceId : "");
      }
    } catch (e) {
      console.error("Failed to list audio devices or get permissions", e);
    }
  }, [selectedInput, selectedOutput]);

  useEffect(() => {
    refreshDevices();
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
      return () =>
        navigator.mediaDevices.removeEventListener(
          "devicechange",
          refreshDevices,
        );
    }
  }, [refreshDevices]);

  useEffect(() => {
    localStorage.setItem("selectedInputDevice", selectedInput);
  }, [selectedInput]);

  useEffect(() => {
    localStorage.setItem("selectedOutputDevice", selectedOutput);
  }, [selectedOutput]);

  useEffect(() => {
    localStorage.setItem("selectedJarvisVoice", selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem(
      "spartanai_security_core_jarvis_sensitivity",
      wakeWordSensitivity.toString(),
    );
  }, [wakeWordSensitivity]);

  useEffect(() => {
    localStorage.setItem(
      "spartanai_security_core_jarvis_bypass_critical",
      allowWakeWordBypassOnCritical.toString(),
    );
  }, [allowWakeWordBypassOnCritical]);

  return (
    <AudioSettingsContext.Provider
      value={{
        inputDevices,
        outputDevices,
        selectedInput,
        setSelectedInput,
        selectedOutput,
        setSelectedOutput,
        selectedVoice,
        setSelectedVoice,
        wakeWordSensitivity,
        setWakeWordSensitivity,
        allowWakeWordBypassOnCritical,
        setAllowWakeWordBypassOnCritical,
        refreshDevices,
      }}
    >
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useAudioSettings must be used within an AudioSettingsProvider",
    );
  }
  return context;
};
