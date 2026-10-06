import * as MediaLibrary from 'expo-media-library';

export async function saveImageToLibrary(uri: string) {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) return { saved: false, reason: 'permission' as const };
  await MediaLibrary.createAssetAsync(uri);
  return { saved: true as const };
}
