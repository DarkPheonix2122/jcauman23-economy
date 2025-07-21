import EnmapDB from "./database/Enmap.js";
import MongooseDB from "./database/Mongoose.js";
import PostgresDB from "./database/Postgres.js";
import SQLiteDB from "./database/SQLite.js";
import pkg from '../package.json' with { type: 'json' };

class Economy {
    constructor(client, options = {}) {
        const [version, code] = pkg.version.split("-")
        if(code === "a"){
            process.emitWarning(
                'This module is in **Alpha** state and is not yet ready for normal use.',
                {
                    code: '@jcauman23/economy',
                    type: 'Warning'
                }
                );
        }else if(code === "b"){
            process.emitWarning(
                'This module is in beta and may be unstable;',
                {
                    code: '@jcauman23/economy',
                    type: 'Warning'
                }
            );
        }
        this.client = client;
        this.options = options;
        this.perGuild = !!options.perGuild;
       if (options.Enmap) {
            this.dbType = "enmap";
            this.defaultValues = options.Enmap.defaultValues;
            this.db = new EnmapDB(options.Enmap.folderLocation, this.defaultValues, this.perGuild);
        } else if (options.Mongoose) {
            this.dbType = "mongoose";
            this.defaultValues = options.Mongoose.defaultValues;
            if (
                options.Mongoose.databaseURL.includes("localhost") ||
                options.Mongoose.databaseURL.includes("127.0.0.1")
            ) {
                const [url, port] = options.Mongoose.databaseURL.split(":");
                options.Mongoose.databaseURL = `mongodb://${url}:${port}/economy`;
            }
            this.db = new MongooseDB(options.Mongoose.databaseURL, this.defaultValues, this.perGuild);
        } else if (options.Postgres) {
            this.dbType = "postgres";
            this.defaultValues = options.Postgres.defaultValues;
            this.db = new PostgresDB(options.Postgres, this.defaultValues, this.perGuild);
        } else if (options.SQLite) {
            this.dbType = "sqlite";
            this.defaultValues = options.SQLite.defaultValues;
            this.db = new SQLiteDB(options.SQLite, this.defaultValues, this.perGuild)
            (async() => {
                await this.db.init();
            })
        } else {
            throw new Error("No valid database options provided.");
        }
        // After DB initialization, handle oldValues migration
        if (options.Mongoose && options.Mongoose.oldValues) {
            this.migrateOldValues(options.Mongoose.oldValues, options.Mongoose.defaultValues);
        }
        if (options.Enmap && options.Enmap.oldValues) {
            this.migrateOldValues(options.Enmap.oldValues, options.Enmap.defaultValues);
        }
        if (options.Postgres && options.Postgres.oldValues) {
            this.migrateOldValues(options.Postgres.oldValues, options.Postgres.defaultValues);
        }
    }

    async migrateOldValues(oldValues, defaultValues) {
        // Get all users from the database
        const allUsers = await this.db.getAllUsers();
        for (const user of allUsers) {
            let updated = false;
            for (const [oldKey, newKey] of Object.entries(oldValues)) {
                if (user[oldKey] !== undefined) {
                    user[newKey] = user[oldKey];
                    delete user[oldKey];
                    updated = true;
                }
            }
            // Ensure new keys exist with default values if not migrated
            for (const [newKey, defValue] of Object.entries(defaultValues)) {
                if (user[newKey] === undefined) {
                    user[newKey] = defValue;
                    updated = true;
                }
            }
            if (updated) {
                await this.db.saveUser(user.key, user);
            }
        }
    }

    async addUser(userId, guildId) {
        const key = this.perGuild ? `${guildId}_${userId}` : userId;
        const data = await this.db.addUser(key, this.defaultValues);
        return new User(key, data, this.db);
    }

    async remUser(userId, guildId) {
        const key = this.perGuild ? `${guildId}_${userId}` : userId;
        return await this.db.remUser(key);
    }

    async findUser(userId, guildId) {
        const key = this.perGuild ? `${guildId}_${userId}` : userId;
        const data = await this.db.findUser(key);
        if (!data) return null;
        return new User(key, data, this.db);
    }
    async getUsersByGuild(guildId) {
        if (!this.perGuild) {
            throw new Error("getUsersByGuild requires perGuild to be true.");
        }

        const allUsers = await this.db.getAllUsers();
        return allUsers
            .filter(user => user.key.startsWith(`${guildId}_`))
            .map(user => user.key.split("_")[1]); // extract userId
    }
}


class User {
    constructor(key, data, db) {
        this.key = key;
        this.data = data;
        this.db = db;
        this.inventory = new Inventory(this);
    }

    set(field, value) {
        this.data[field] = value;
    }

    async save() {
        await this.db.saveUser(this.key, this.data);
    }
}

class Inventory {
    constructor(user) {
        this.user = user;
        if (!this.user.data.inventory) this.user.data.inventory = [];
    }

    add(item, price, options = {}) {
        this.user.data.inventory.push({ name: item, type: (options.type ? options.type : "item"), price: (price ? parseInt(price) : 0), ...options});
        return [true, this.user.inventory]
    }

    remove(item) {
        this.user.data.inventory = this.user.data.inventory.filter(i => i !== item);
        return true;
    }

    reset() {
        this.user.data.inventory = [];
        return true
    }

    show() {
        return this.user.data.inventory;
    }

    find(data) {
        const check = this.user.data.inventory.find(i => i.name === data);
        if(!check) return [false];
        return [true, { item: check.name, type: check.type, price: check.price }];
    }
}

export default Economy;