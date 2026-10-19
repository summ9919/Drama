import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraHome } from '../../components/business/CameraHome';
import { PhotoReview } from '../../components/business/PhotoReview';
import { Screen } from '../../components/ui/Screen';
import { useCameraFlow } from '../../hooks/useCameraFlow';
import { saveImageToLibrary } from '../../lib/media';
import { useCaptureStore } from '../../store/captureStore';

export default function CameraRoute() {
  const router = useRouter();
  const camera = useCameraFlow();
  const capturedUri = useCaptureStore((state) => state.capturedUri);
  const setCapturedUri = useCaptureStore((state) => state.setCapturedUri);
  const clearCapturedUri = useCaptureStore((state) => state.clearCapturedUri);
  const addSavedUri = useCaptureStore((state) => state.addSavedUri);
  const [saving, setSaving] = useState(false);

  const openCamera = async () => {
    const granted = await camera.open();
    if (granted) router.push('/capture');
  };

  const retake = async () => {
    clearCapturedUri();
    const granted = await camera.open();
    if (granted) router.push('/capture');
  };

  const save = async () => {
    if (!capturedUri) return;
    setSaving(true);
    try {
      const result = await saveImageToLibrary(capturedUri);
      if (!result.saved) {
        Alert.alert('需要相册权限', '请允许Drama相机访问相册，以便保存你的作品。');
        return;
      }
      addSavedUri(capturedUri);
      Alert.alert('已保存', '这张照片已经回到你的相册了。', [{ text: '去相册', onPress: () => router.navigate('/album') }, { text: '继续拍摄' }]);
    } catch {
      Alert.alert('保存失败', '请稍后再试。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      {capturedUri ? (
        <PhotoReview uri={capturedUri} onRetake={retake} onSave={save} saving={saving} />
      ) : (
        <CameraHome permissionGranted={camera.permissionGranted} onOpenCamera={openCamera} />
      )}
    </Screen>
  );
}
