import { Pool } from "pg";

class PostgresDB {
    constructor(options, defaultValues, perGuild) {
        this.pool = new Pool({
            connectionString: options.databaseURL,
        });
        this.defaultValues = defaultValues;
        this.perGuild = perGuild;
        this.table = options.tableName || "eco_users";
        this.init();
    }

    async init() {
        // Build columns from defaultValues
        let columns = Object.entries(this.defaultValues)
            .map(([key, value]) => `"${key}" ${typeof value === "number" ? "INTEGER" : "TEXT"} DEFAULT '${value}'`)
            .join(", ");
        columns += ', "inventory" TEXT[] DEFAULT \'{}\', "key" TEXT PRIMARY KEY';

        await this.pool.query(
            `CREATE TABLE IF NOT EXISTS "${this.table}" (${columns})`
        );
    }

    async addUser(key, defaultValues) {
        const exists = await this.findUser(key);
        if (exists) return exists;
        const fields = Object.keys(defaultValues).concat(["inventory", "key"]);
        const values = Object.values(defaultValues).concat([[], key]);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
        await this.pool.query(
            `INSERT INTO "${this.table}" (${fields.map(f => `"${f}"`).join(", ")}) VALUES (${placeholders})`,
            values
        );
        return await this.findUser(key);
    }

    async remUser(key) {
        const res = await this.pool.query(
            `DELETE FROM "${this.table}" WHERE "key" = $1`,
            [key]
        );
        return res.rowCount > 0;
    }

    async findUser(key) {
        const res = await this.pool.query(
            `SELECT * FROM "${this.table}" WHERE "key" = $1`,
            [key]
        );
        return res.rows[0] || null;
    }

    async saveUser(key, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(", ");
        await this.pool.query(
            `UPDATE "${this.table}" SET ${setClause} WHERE "key" = $${fields.length + 1}`,
            [...values, key]
        );
        return true;
    }

    async getAllUsers() {
        const res = await this.pool.query(`SELECT * FROM "${this.table}"`);
        return res.rows;
    }

    async getAllUserIds() {
        const res = await this.pool.query("SELECT key FROM users");
        return res.rows.map(row => {
            const keys = row.key;
            return keys;
        });
    }
}

export default PostgresDB;