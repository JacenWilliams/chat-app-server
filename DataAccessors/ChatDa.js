const bcrypt = require('bcrypt');
const TokenManager = require('./TokenManager');
const tokenManager = new TokenManager();
const mysql = require('mysql2/promise');

class ChatDa {
    constructor() {
        this.dbOptions = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASS,

        };
    }

    async getMessages() {
        const sql = `SELECT     Id,
                                PostedTimeStamp,
                                Message,
                                UserId
                    FROM        chats;`;

        let conn = await mysql.createConnection(this.dbOptions);
        let [results, fields] = await conn.query(sql);
        await conn.end();

        return results.map;
    }

    async saveMessage(msg, userId) {
        const sql =
            "   INSERT INTO chats (UserId, " +
            "                      Message)" +
            "   VALUES      (?, ?);        ";

        let conn = await mysql.createConnection(this.dbOptions);
        let [results, fields] = await conn.query(sql, [userId, msg]);
        await conn.end();

        return results.insertId;
    }

    async getLastMessages(qty) {
        const sql =
            "   SELECT  c.Id,           " +
            "           c.PostedTimeStamp,    " +
            "           c.Message,       " +
            "           u.UserName,      " +
            "           c.UserId        " +
            "   FROM    chats c         " +
            "   JOIN    users u         " +
            "   ON      c.UserId = u.Id " +
            "   LIMIT   ?               ";

        let conn = await mysql.createConnection(this.dbOptions);
        let [results, fields] = await conn.query(sql, [qty]);
        await conn.end();

        return results.map(row => {
            return {
                id: row.Id,
                postedTimeStamp: new Date(row.PostedTimeStamp),
                message: row.Message,
                username: row.UserName,
                userId: row.UserId
            }
        });
    }

    async getMessage(messageId) {
        const sql =
            "   SELECT  c.Id,           " +
            "           c.PostedTimeStamp,    " +
            "           c.Message,      " +
            "           u.UserName,     " +
            "           c.UserId        " +
            "   FROM    chats c         " +
            "   JOIN    users u         " +
            "   ON      c.UserId = u.Id " +
            "   where   c.Id = ?        ";

        let conn = await mysql.createConnection(this.dbOptions);
        let [results, fields] = await conn.query(sql, [messageId]);
        await conn.end();

        if (results.length > 1) {
            throw new Error("Found multiple chats with same Id");
        }

        if (results.length < 1) {
            return null;
        }

        let result = results[0];

        return {
            id: result.Id,
            postedTimeStamp: new Date(result.PostedTimeStamp),
            message: result.Message,
            username: result.UserName,
            userId: result.UserId
        }
    }
}

module.exports = ChatDa;