"use strict";

// var cfg = 
// {
//     dialect: 'mssql',
//     connection: {
//         host: 'localhost',
//         database: 'HegreTest',
//         user: 'komail',
//         password: '123456',
//     }
// };

var cfg = 
{
    dialect: 'mysql',
    connection: {
        host: 'localhost',
        database: 'hegre',
        user: 'root',
        password: 'admin',
    }
};

var knex = require("knex")(cfg);

module.exports = knex;