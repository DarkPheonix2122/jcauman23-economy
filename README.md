--IMPORTANT--
`this module is in *0.0.1-a* state and is not yet ready for normal use.`
# Methods
## Initialize
```js
import Economy from "@jcauman23/economy";
import { Client } from "discord.js";
const client = new Client();
client.economy = new Economy(client, {
    perGuild: true,
    Enmap: {
        folderLocation: "./",
        defaultValues: {
            coins: 0,
            bankCoins: 0,
            bankLevel: 0,
            bankMax: 1000,
            //inventory: [] (Removed, use Inventory class instead)
        },
        oldValues: {
            coins: "nekos",
            bankCoins: "bank",
            bankLevel: "bankLevels",
            bankMaxs: "bankMax",
            //inventory: "inventory" (Removed, use Inventory class instead)
        }
    },
    //WARNING: NOTHING BUT THE ENMAP DATABASE HAS BEEN TESTED WORKING, USE AT OWN RISK.
    Mongoose: {
        databaseURL: "localhost:27017",
        //if used "localhost:port" it will automatically open a database at "/economy"
        defaultValues: {
            coins: 0,
            bankCoins: 0,
            bankLevel: 0,
            bankMax: 1000,
            //inventory: [] (Removed, use Inventory class instead)
        },
        oldValues: {
            coins: "nekos",
            bankCoins: "bank",
            bankLevel: "bankLevels",
            bankMaxs: "bankMax",
            //inventory: "inventory" (Removed, use Inventory class instead)
        }
    },
    Postgres: {
        databaseURL: "postgres://user:password@localhost:5432/economy",
        defaultValues: {
            coins: 0,
            bankCoins: 0,
            bankLevel: 0,
            bankMax: 1000,
            //inventory: [] (Removed, use Inventory class instead)
        },
        oldValues: {
            coins: "nekos",
            bankCoins: "bank",
            bankLevel: "bankLevels",
            bankMaxs: "bankMax",
            //inventory: "inventory" (Removed, use Inventory class instead)
        }
        tableName: "eco_users"
    },
    SQLite: {
        filePath: "./economy.sqlite",
        defaultValues: {
            nekos: 0,
            bankCoins: 0,
            bankLevel: 0,
            bankMax: 1000,
            //inventory: [] (Removed, use Inventory class instead)
        },
        oldValues: {
            coins: "nekos",
            bankCoins: "bank",
            bankLevel: "bankLevels",
            bankMaxs: "bankMax",
            //inventory: "inventory" (Removed, use Inventory class instead)
        }
    }
    //can only use **ONE** Database per instance
    //oldValues use the 1st value as the key for the old data, and the 2nd value as the new key for the new data, it auto migrates the data from the old key to the new key
});
```
## addUser
```js
client.economy.addUser(userId, guildId);
```
## remUser
```js
await client.economy.remUser(userId, guildId);
```
## findUser
```js
//always use await when finding a user
const user = await client.economy.findUser(userId, guildId);
//all data is in the user.data object
console.log(user.data.coins);
```
## getUsersByGuild  
```js
client.economy.getUsersByGuild(guildId);
```
## User Object
### getUser
```js
const user = await client.economy.getUser(userId, guildId);
//This will return the user object with all the data
```
### set
```js
user.set(field, value);
//this will set a certain field in the database(use parseInt() if value is a number)
```
### save
```js
await user.save();
//This will save the user and the changes to the database
```
## User Inventory Object
### add
```js
user.inventory.add(item, price, options);
//options can be extra values you want in the users item inventory, for example:
user.inventory.add("sword", 100, { type: "sword", damage: 10 });
//Which will return [true, { item: "sword", type: "sword", price: 100, damage: 10 }] when used inventory.find()
```
### remove
```js
user.inventory.remove(item);
//This will remove the item from the user's inventory
```
### reset
```js
user.inventory.reset();
//This will reset the user's inventory to an empty array
```
### show
```js
user.inventory.show();
//This will return the user's inventory
```
### find
```js
const [check, itemArgs] = user.inventory.find(item);
if(check) console.log(itemArgs);
//This will return [true, { item: "sword", type: "sword", price: 100, damage: 10 }] if the item is found in the user's inventory
//This will return [false] if the item is not found in the user's inventory
```
# Databases
## Enmap
This database is the most basic and is used for simple key-value storage. It is not recommended for large-scale applications.
folderLocation **MUST** be set to the folder where the database file is located.
## Mongoose
This database uses MongoDB for storage and is recommended for applications that require more complex data structures and relationships.
databaseURL **CAN** be set to "localhost:port" and it will automatically use the provided port to connect to the localhost database at mongodb://localhost:port/economy. otherwise use mongodb://user:password@host:port/database instead
## Postgres
This database uses PostgreSQL for storage and is recommended for applications that require more complex data structures and relationships.
## SQLite
This database uses SQLite for storage and is recommended for applications that require more complex data structures and relationships.
filePath **MUST** be set to the file path of the database file.
# Example
```js
import Economy from "@jcauman23/economy";
import { Client } from "discord.js";
const client = new Client();
client.economy = new Economy(client, {
    perGuild: false,
    Enmap: {
        folderLocation: "./",
        defaultValues: {
            coins: 0,
            bankCoins: 0,
            bankLevel: 0,
            bankMax: 1000,
            //inventory: [] (Removed, use Inventory class instead)
        }
    }
});
//if perGuild is false, only use userId
const user = awaitclient.economy.findUser(userId)
