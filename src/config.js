// src/config.js
import { Platform } from 'react-native';

// The iOS simulator and Android emulator-via-adb can reach localhost on
// your Mac. Real devices need your Mac's LAN IP.
const LAN_IP = '192.168.1.116'; // update if your IP changed

let baseURL = "https://staff-arts-v2-y3c8h.ondigitalocean.app";

/*
if (Platform.OS === 'ios') {
  baseURL = 'http://localhost:3000';
} else if (Platform.OS === 'android') {
  baseURL = 'http://10.0.2.2:3000'; // Android emulator's alias for host's localhost
} else {
  baseURL = `http://${LAN_IP}:3000`;
}
*/
export const API_BASE_URL = baseURL;