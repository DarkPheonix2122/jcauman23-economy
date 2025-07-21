import mongoose from "mongoose";

function buildSchema(defaultValues) {
    const schemaDef = {};
    for (const key in defaultValues) {
        schemaDef[key] = { type: typeof defaultValues[key] === "number" ? Number : String, default: defaultValues[key] };
    }
    schemaDef.inventory = { type: [String], default: [] };
    return new mongoose.Schema(schemaDef);
}

class MongooseDB {
    constructor(databaseURL, defaultValues, perGuild) {
        this.connected = false;
        this.defaultValues = defaultValues;
        this.perGuild = perGuild;
        this.keyField = "key";
        this.schema = buildSchema(defaultValues);
        this.schema.add({ key: { type: String, required: true, unique: true } });
        this.Model = mongoose.models.EcoUser || mongoose.model("EcoUser", this.schema);

        mongoose.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => { this.connected = true; })
            .catch(() => { this.connected = false; });
    }

    async addUser(key, defaultValues) {
        let user = await this.Model.findOne({ key });
        if (!user) {
            user = new this.Model({ key, ...defaultValues, inventory: [] });
            await user.save();
        }
        return user.toObject();
    }

    async remUser(key) {
        const res = await this.Model.deleteOne({ key });
        return res.deletedCount > 0;
    }

    async findUser(key) {
        const user = await this.Model.findOne({ key });
        return user ? user.toObject() : null;
    }

    async saveUser(key, data) {
        await this.Model.updateOne({ key }, data, { upsert: true });
        return true;
    }

    async getAllUsers() {
        return await this.Model.find({}); // only fetch the key field
    }

    async getAllUserIds() {
        if (!this.perGuild) {
            throw new Error("getAllUserIds requires perGuild to be true.");
        }

        const allUsers = await this.db.getAllUsers();
        return allUsers
            .map(user => {
                const keys = user.key;
                return keys;
            });
    }
}

export default MongooseDB;