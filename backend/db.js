const pg = require('pg');
require('dotenv').config();

const client = new pg.Client({
    user: 'rezepte_datenbank_merlind',
    host: 'psql.f4.htw-berlin.de',
    database: 'rezepte_datenbank',
    password: '0qt7880uk',
    port: 5432,
});

client.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connection to DB ...');
    }
});

module.exports = client;