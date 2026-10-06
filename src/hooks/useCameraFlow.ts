import { useState } from 'react';
import { useCameraPermissions } from 'expo-camera';

export function useCameraFlow() {
  const [permission, requestPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);

  const open = async () => {
    if (!permission?.granted) {
      const nextPermission = await requestPermission();
      if (!nextPermission.granted) return false;
    }
    setVisible(true);
    return true;
  };

  return {
    permissionGranted: permission?.granted ?? false,
    visible,
    open,
    close: () => setVisible(false),
  };
}
