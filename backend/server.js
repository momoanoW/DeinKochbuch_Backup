
const express = require('express');
const bodyParser = require('body-parser');
const client = require('./db');
const routes = require('./routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(routes);

console.log("Registrierte Routen:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route);
    } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((route) => {
            console.log(route.route);
        });
    }
});

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ... `);
    }
});

