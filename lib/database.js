import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('experience_sampling.db');

  // Create tables for structured data
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sentiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood INTEGER NOT NULL,
      energy INTEGER NOT NULL,
      stress INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vlogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  return db;
}

export async function getDatabase() {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

// Sentiment CRUD
export async function saveSentiment(mood, energy, stress) {
  const database = await getDatabase();
  const timestamp = new Date().toISOString();
  await database.runAsync(
    'INSERT INTO sentiments (mood, energy, stress, timestamp) VALUES (?, ?, ?, ?)',
    [mood, energy, stress, timestamp]
  );
}

export async function getAllSentiments() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM sentiments ORDER BY timestamp DESC');
}

// Location CRUD
export async function saveLocation(latitude, longitude) {
  const database = await getDatabase();
  const timestamp = new Date().toISOString();
  await database.runAsync(
    'INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)',
    [latitude, longitude, timestamp]
  );
}

export async function getAllLocations() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM locations ORDER BY timestamp DESC');
}

// Vlog CRUD
export async function saveVlog(filePath) {
  const database = await getDatabase();
  const timestamp = new Date().toISOString();
  await database.runAsync(
    'INSERT INTO vlogs (file_path, timestamp) VALUES (?, ?)',
    [filePath, timestamp]
  );
}

export async function getAllVlogs() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM vlogs ORDER BY timestamp DESC');
}
