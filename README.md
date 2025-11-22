# Experience Sampling App

一個用於取樣的 React Native 應用程式，使用 Expo SDK 54 開發。
- **My app URI**
   ```bash
   https://expo.dev/accounts/wooyuu/projects/experience-sampling-app/builds/f332a1a7-50ce-4d77-8dab-5fd0c85d6a20
   ```

## 功能特色

- **情緒問卷調查** - 記錄心情、精力、壓力程度 (1-5 分)
- **1 秒 Vlog 錄製** - 使用前置鏡頭錄製短影片
- **GPS 定位追蹤** - 記錄當下位置座標
- **每日提醒通知** - 每天 9:00、14:00、20:00 發送提醒
- **資料匯出功能** - 將所有資料匯出為 JSON 檔案

## 使用的模組

- `expo-notifications` - 通知功能
- `expo-sqlite` - 本地資料庫
- `expo-camera` - 相機與錄影
- `expo-file-system` - 檔案系統操作
- `expo-sharing` - 分享/匯出功能
- `expo-location` - GPS 定位

## 環境需求

- Node.js 18+
- npm 或 yarn
- Expo CLI
- EAS CLI (用於建置 APK)
- Expo 帳號

## 安裝步驟

1. 複製專案並安裝依賴：

   ```bash
   npm install
   ```

2. 登入 Expo 帳號：

   ```bash
   npx eas login
   ```

## 開發模式執行

在開發模式下執行（使用 Expo Go 測試）：

```bash
npx expo start
```

或使用 tunnel 模式（適用於不同網路環境）：

```bash
npx expo start --tunnel
```

掃描 QR code 後在 Expo Go 中開啟。

**注意：** Expo Go 不完全支援影片錄製功能，請使用 APK 測試完整功能。

## 建置 APK

1. 執行 EAS Build：

   ```bash
   eas build --platform android --profile preview
   ```

2. 等待建置完成後，從 Expo 網站下載 APK 安裝至 Android 裝置。

## 使用說明

### 首頁 - 情緒問卷

1. 使用滑桿調整 Mood（心情）、Energy（精力）、Stress（壓力）分數
2. 點擊 **Submit Survey** 儲存問卷
3. 點擊 **Record 1-Second Vlog** 錄製短影片

### 設定頁面

- **Schedule Daily Notifications** - 設定每日三次提醒（9:00、14:00、20:00）
- **Export All Data** - 匯出所有資料為 JSON 檔案
- **View All Records** - 查看已記錄的所有資料

### 資料查看

在 View All Records 頁面可以切換檢視：
- Sentiments - 情緒問卷紀錄
- Locations - GPS 位置紀錄
- Vlogs - 錄影紀錄

## 資料儲存位置

所有資料儲存在應用程式的 Document 目錄：
- SQLite 資料庫：情緒問卷、位置、影片路徑
- 影片檔案：`/data/vlog_[timestamp].mp4`
- 匯出檔案：`/data/sentiments.json`、`locations.json`、`vlogs.json`
