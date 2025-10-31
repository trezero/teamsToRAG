import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file location
const DB_PATH = path.join(__dirname, '..', '.cache', 'teams-cache.db');

// Cache validity period (24 hours in milliseconds)
const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000;

/**
 * Initialize the database and create tables if they don't exist
 */
function initDatabase() {
  // Create .cache directory if it doesn't exist
  const cacheDir = path.join(__dirname, '..', '.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  
  // Create chats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      chat_type TEXT,
      topic TEXT,
      display_name TEXT,
      members TEXT,
      created_at INTEGER,
      last_updated INTEGER,
      fetched_at INTEGER
    )
  `);

  // Create teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      description TEXT,
      fetched_at INTEGER
    )
  `);

  // Create channels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      team_id TEXT,
      display_name TEXT,
      description TEXT,
      fetched_at INTEGER,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // Create cache metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache_metadata (
      key TEXT PRIMARY KEY,
      last_full_sync INTEGER
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chats_fetched_at ON chats(fetched_at);
    CREATE INDEX IF NOT EXISTS idx_channels_team_id ON channels(team_id);
    CREATE INDEX IF NOT EXISTS idx_teams_fetched_at ON teams(fetched_at);
  `);

  return db;
}

/**
 * Check if cache is valid (less than 24 hours old)
 * @param {string} cacheType - 'chats' or 'teams'
 * @returns {boolean}
 */
export function isCacheValid(cacheType) {
  const db = initDatabase();
  
  try {
    const row = db.prepare('SELECT last_full_sync FROM cache_metadata WHERE key = ?').get(cacheType);
    
    if (!row) {
      return false;
    }

    const lastSync = row.last_full_sync;
    const now = Date.now();
    
    return (now - lastSync) < CACHE_VALIDITY_MS;
  } finally {
    db.close();
  }
}

/**
 * Save chats to cache
 * @param {Array} chats - Array of chat objects
 */
export function saveChatsToCache(chats) {
  const db = initDatabase();
  
  try {
    const now = Date.now();
    
    // Begin transaction for better performance
    const insertChat = db.prepare(`
      INSERT OR REPLACE INTO chats (id, chat_type, topic, display_name, members, created_at, last_updated, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((chats) => {
      for (const chat of chats) {
        insertChat.run(
          chat.id,
          chat.chatType || null,
          chat.topic || null,
          chat.displayName || null,
          JSON.stringify(chat.members || []),
          chat.createdDateTime ? new Date(chat.createdDateTime).getTime() : null,
          chat.lastUpdatedDateTime ? new Date(chat.lastUpdatedDateTime).getTime() : null,
          now
        );
      }
    });

    insertMany(chats);

    // Update cache metadata
    db.prepare(`
      INSERT OR REPLACE INTO cache_metadata (key, last_full_sync)
      VALUES ('chats', ?)
    `).run(now);

    return chats.length;
  } finally {
    db.close();
  }
}

/**
 * Get chats from cache
 * @returns {Array} Array of chat objects
 */
export function getChatsFromCache() {
  const db = initDatabase();
  
  try {
    const rows = db.prepare(`
      SELECT id, chat_type, topic, display_name, members, created_at, last_updated, fetched_at
      FROM chats
      ORDER BY last_updated DESC
    `).all();

    return rows.map(row => ({
      id: row.id,
      chatType: row.chat_type,
      topic: row.topic,
      displayName: row.display_name,
      members: JSON.parse(row.members || '[]'),
      createdDateTime: row.created_at ? new Date(row.created_at).toISOString() : null,
      lastUpdatedDateTime: row.last_updated ? new Date(row.last_updated).toISOString() : null,
      fetchedAt: row.fetched_at,
    }));
  } finally {
    db.close();
  }
}

/**
 * Save teams to cache
 * @param {Array} teams - Array of team objects
 */
export function saveTeamsToCache(teams) {
  const db = initDatabase();
  
  try {
    const now = Date.now();
    
    const insertTeam = db.prepare(`
      INSERT OR REPLACE INTO teams (id, display_name, description, fetched_at)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((teams) => {
      for (const team of teams) {
        insertTeam.run(
          team.id,
          team.displayName || null,
          team.description || null,
          now
        );
      }
    });

    insertMany(teams);

    // Update cache metadata
    db.prepare(`
      INSERT OR REPLACE INTO cache_metadata (key, last_full_sync)
      VALUES ('teams', ?)
    `).run(now);

    return teams.length;
  } finally {
    db.close();
  }
}

/**
 * Get teams from cache
 * @returns {Array} Array of team objects
 */
export function getTeamsFromCache() {
  const db = initDatabase();
  
  try {
    const rows = db.prepare(`
      SELECT id, display_name, description, fetched_at
      FROM teams
      ORDER BY display_name
    `).all();

    return rows.map(row => ({
      id: row.id,
      displayName: row.display_name,
      description: row.description,
      fetchedAt: row.fetched_at,
    }));
  } finally {
    db.close();
  }
}

/**
 * Save channels to cache
 * @param {string} teamId - Team ID
 * @param {Array} channels - Array of channel objects
 */
export function saveChannelsToCache(teamId, channels) {
  const db = initDatabase();
  
  try {
    const now = Date.now();
    
    const insertChannel = db.prepare(`
      INSERT OR REPLACE INTO channels (id, team_id, display_name, description, fetched_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((channels) => {
      for (const channel of channels) {
        insertChannel.run(
          channel.id,
          teamId,
          channel.displayName || null,
          channel.description || null,
          now
        );
      }
    });

    insertMany(channels);

    return channels.length;
  } finally {
    db.close();
  }
}

/**
 * Get channels from cache for a specific team
 * @param {string} teamId - Team ID
 * @returns {Array} Array of channel objects
 */
export function getChannelsFromCache(teamId) {
  const db = initDatabase();
  
  try {
    const rows = db.prepare(`
      SELECT id, team_id, display_name, description, fetched_at
      FROM channels
      WHERE team_id = ?
      ORDER BY display_name
    `).all(teamId);

    return rows.map(row => ({
      id: row.id,
      teamId: row.team_id,
      displayName: row.display_name,
      description: row.description,
      fetchedAt: row.fetched_at,
    }));
  } finally {
    db.close();
  }
}

/**
 * Get all channels from cache with team information
 * @returns {Array} Array of channel objects with team info
 */
export function getAllChannelsFromCache() {
  const db = initDatabase();
  
  try {
    const rows = db.prepare(`
      SELECT 
        c.id,
        c.team_id,
        c.display_name,
        c.description,
        c.fetched_at,
        t.display_name as team_name
      FROM channels c
      JOIN teams t ON c.team_id = t.id
      ORDER BY t.display_name, c.display_name
    `).all();

    return rows.map(row => ({
      id: row.id,
      teamId: row.team_id,
      displayName: row.display_name,
      description: row.description,
      fetchedAt: row.fetched_at,
      teamName: row.team_name,
    }));
  } finally {
    db.close();
  }
}

/**
 * Clear all cache data
 */
export function clearCache() {
  const db = initDatabase();
  
  try {
    db.exec('DELETE FROM chats');
    db.exec('DELETE FROM teams');
    db.exec('DELETE FROM channels');
    db.exec('DELETE FROM cache_metadata');
  } finally {
    db.close();
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  const db = initDatabase();
  
  try {
    const chatCount = db.prepare('SELECT COUNT(*) as count FROM chats').get().count;
    const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const channelCount = db.prepare('SELECT COUNT(*) as count FROM channels').get().count;
    
    const chatSync = db.prepare('SELECT last_full_sync FROM cache_metadata WHERE key = ?').get('chats');
    const teamSync = db.prepare('SELECT last_full_sync FROM cache_metadata WHERE key = ?').get('teams');
    
    return {
      chats: {
        count: chatCount,
        lastSync: chatSync ? new Date(chatSync.last_full_sync) : null,
        isValid: chatSync ? isCacheValid('chats') : false,
      },
      teams: {
        count: teamCount,
        lastSync: teamSync ? new Date(teamSync.last_full_sync) : null,
        isValid: teamSync ? isCacheValid('teams') : false,
      },
      channels: {
        count: channelCount,
      },
    };
  } finally {
    db.close();
  }
}
