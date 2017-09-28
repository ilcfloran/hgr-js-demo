"use strict";

var cfg = 
{
    dialect: 'mssql',
    connection: {
        host: 'localhost',
        database: 'HegreTest',
        user: 'komail',
        password: '123456',
    }
};

var knex = require("knex")(cfg);

module.exports = knex;