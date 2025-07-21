import Enmap from "enmap";

class EnmapDB {
    constructor(folderLocation, defaultValues, perGuild) {
        this.store = new Enmap({ name: "economy", dataDir: folderLocation, autoFetch: true, fetchAll: true });
        this.defaultValues = defaultValues;
        this.perGuild = perGuild;
    }

    async addUser(key, defaultValues) {
        if (!this.store.has(key)) {
            this.store.set(key, { ...defaultValues, inventory: [] });
        }
        return this.store.get(key);
    }

    async remUser(key) {
        if (this.store.has(key)) {
            this.store.delete(key);
            return true;
        }
        return false;
    }

    async findUser(key) {
        return this.store.get(key) || null;
    }

    async saveUser(key, data) {
        this.store.set(key, data);
        return true;
    }

    async getAllUsers() {
        return this.store.map((value, key) => ({ key, value}));
    }

    async getAllUserIds() {
        return this.store.map((value, key) => (key));
    }
}

export default EnmapDB;