import React, { useRef } from 'react';
import { Alert, Modal } from 'react-native';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { CameraCapture } from '../../components/business/CameraCapture';
import { CameraHome } from '../../components/business/CameraHome';
import { PhotoReview } from '../../components/business/PhotoReview';
import { Screen } from '../../components/ui/Screen';
import { useCameraFlow } from '../../hooks/useCameraFlow';
import { saveImageToLibrary } from '../../lib/media';
import { useCaptureStore } from '../../store/captureStore';

export default function CameraRoute() {
  const router = useRouter();
  const camera = useCameraFlow();
  const cameraRef = useRef<CameraView>(null);
  const capturedUri = useCaptureStore((state) => state.capturedUri);
  const setCapturedUri = useCaptureStore((state) => state.setCapturedUri);
  const addSavedUri = useCaptureStore((state) => state.addSavedUri);
  const clearCapturedUri = useCaptureStore((state) => state.clearCapturedUri);
  const [saving, setSaving] = React.useState(false);

  const takePhoto = async () => {
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.9, skipProcessing: true });
    if (picture?.uri) {
      setCapturedUri(picture.uri);
      camera.close();
    }
  };

  const retake = async () => {
    clearCapturedUri();
    await camera.open();
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

  return <Screen>
    {capturedUri ? <PhotoReview uri={capturedUri} onRetake={retake} onSave={save} saving={saving} /> : <CameraHome permissionGranted={camera.permissionGranted} onOpenCamera={camera.open} />}
    <Modal visible={camera.visible} animationType="slide" onRequestClose={camera.close}><CameraCapture cameraRef={cameraRef} onClose={camera.close} onCapture={takePhoto} /></Modal>
  </Screen>;
}
