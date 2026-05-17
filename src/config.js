// Use your Mac's LAN IP for Expo Go testing on a real phone.
// Find it: System Settings → Network → look for "Wi-Fi" IP address.
// Example: 192.168.1.42
//
// On the iOS simulator, localhost works. On a real device, localhost won't —
// the phone needs to reach your Mac over WiFi.

import { Platform } from 'react-native';

// CHANGE THIS to your Mac's LAN IP
const LAN_IP = '192.168.1.71';

export const API_BASE_URL =
  Platform.OS === 'web' || __DEV__ === false
    ? 'http://localhost:3000'
    : `http://${LAN_IP}:3000`;