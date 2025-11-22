import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SURVEYS: 'surveys',
  LOCATIONS: 'locations',
  VLOGS: 'vlogs',
};

// 初始化資料庫（AsyncStorage 不需要特別初始化）
export async function initDatabase() {
  for (const key of Object.values(KEYS)) {
    const data = await AsyncStorage.getItem(key);
    if (data === null) {
      await AsyncStorage.setItem(key, JSON.stringify([]));
    }
  }
}

// 取得資料
async function getData(key) {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// 儲存資料
async function addData(key, item) {
  const data = await getData(key);
  const newItem = {
    id: Date.now(),
    ...item,
    timestamp: new Date().toISOString(),
  };
  data.unshift(newItem);
  await AsyncStorage.setItem(key, JSON.stringify(data));
  return newItem;
}

// 儲存問卷
export async function saveSurvey(mood, energy, stress) {
  return await addData(KEYS.SURVEYS, { mood, energy, stress });
}

// 儲存 GPS
export async function saveLocation(latitude, longitude) {
  return await addData(KEYS.LOCATIONS, { latitude, longitude });
}

// 儲存 vlog 記錄
export async function saveVlog(filename, filepath) {
  return await addData(KEYS.VLOGS, { filename, filepath });
}

// 取得所有問卷
export async function getAllSurveys() {
  return await getData(KEYS.SURVEYS);
}

// 取得所有 GPS 記錄
export async function getAllLocations() {
  return await getData(KEYS.LOCATIONS);
}

// 取得所有 vlog 記錄
export async function getAllVlogs() {
  return await getData(KEYS.VLOGS);
}

// 匯出所有資料為 JSON
export async function exportAllData() {
  const surveys = await getAllSurveys();
  const locations = await getAllLocations();
  const vlogs = await getAllVlogs();

  return {
    exportDate: new Date().toISOString(),
    surveys,
    locations,
    vlogs,
  };
}

// 清除所有資料（測試用）
export async function clearAllData() {
  for (const key of Object.values(KEYS)) {
    await AsyncStorage.setItem(key, JSON.stringify([]));
  }
}