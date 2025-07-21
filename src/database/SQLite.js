// ./database/SQLiteDB.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

class SQLiteDB {
    constructor(options, defaultValues, perGuild) {
        this.filePath = options.filePath || "./database/economy.sqlite";
        this.defaultValues = defaultValues;
        this.perGuild = perGuild;
    }

    async init() {
        this.db = await open({
            filename: this.filePath,
            driver: sqlite3.Database
        });

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                key TEXT PRIMARY KEY,
                data TEXT
            );
        `);
    }

    async addUser(key, defaults) {
        const exists = await this.findUser(key);
        if (exists) return exists;

        const data = JSON.stringify(defaults);
        await this.db.run("INSERT INTO users (key, data) VALUES (?, ?)", key, data);
        return { key, ...defaults };
    }

    async remUser(key) {
        await this.db.run("DELETE FROM users WHERE key = ?", key);
    }

    async findUser(key) {
        const row = await this.db.get("SELECT data FROM users WHERE key = ?", key);
        if (!row) return null;
        return JSON.parse(row.data);
    }

    async saveUser(key, data) {
        const stringified = JSON.stringify(data);
        await this.db.run("REPLACE INTO users (key, data) VALUES (?, ?)", key, stringified);
    }

    async getAllUsers() {
        const rows = await this.db.all("SELECT key, data FROM users");
        return rows.map(row => ({ key: row.key, ...JSON.parse(row.data) }));
    }

    async getAllUserIds() {
        const rows = await this.db.all("SELECT key FROM users");
        return rows.map(row => {
            const key = row.key;
            return key;
        });
    }
}

export default SQLiteDB;
