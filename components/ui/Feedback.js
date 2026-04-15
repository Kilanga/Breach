import { Platform, ToastAndroid, Alert } from 'react-native';

export function showFeedback(message, type = 'info') {
  // type: 'info' | 'success' | 'error'
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    );
  } else {
    Alert.alert(
      type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Info',
      message
    );
  }
}
