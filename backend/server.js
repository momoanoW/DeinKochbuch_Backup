
const express = require('express');
const client = require('./db');
const routes = require('./routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', routes);
console.log("Registrierte Routen:", app._router.stack);

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ... `);
    }
});

