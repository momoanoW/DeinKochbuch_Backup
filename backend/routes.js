const express = require('express');
const router = express.Router();

// GET all recipes
router.get('/rezepte', async(req, res) => {
    const query = `SELECT * FROM rezepte `;

    try {
        const result = await client.query(query)
        console.log(result)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
    }
});

// GET one specific recipe
router.get('/rezepte/:id', async (req, res) => {

    const query = `
        SELECT r.name AS rezept, z.name AS zutat, b.menge
        FROM beinhaltet b
        JOIN zutaten z ON b.zutaten_id = z.id
        JOIN rezepte r ON b.rezepte_id = r.id
        WHERE b.rezepte_id = $1;
    `;
    try {
        const rezeptId = req.params.id;
        const result = await client.query(query, [rezeptId]);
        res.send(result.rows);
    } catch (err) {
        console.log("error", err.stack)
        res.status(500).send('Fehler beim Abrufen des Rezeptes');
    }
});

// POST one user
router.post('/users', async(req, res) => {
    let name = (req.body.name) ? req.body.name : null;
    let passwort = (req.body.passwort) ? req.body.passwort : null;

    const query = `INSERT INTO users(name, passwort) VALUES ($1, $2) RETURNING *`;

    try {
        const result = await client.query(query, [name, passwort])
        console.log(result)
        res.send(result.rows[0]);
    } catch (err) {
        console.log(err.stack)
    }
});

// POST one recipe
router.post('/neuesrezept', async(req, res) => {
    let name = (req.body.name) ? req.body.name : null;
    let anleitung = (req.body.anleitung) ? req.body.anleitung : null;
    let anzahlportionen = (req.body.anzahlportionen) ? req.body.anzahlportionen : null;
    let zubereitungszeitmin = (req.body.zubereitungszeitmin) ? req.body.zubereitungszeitmin : null;
    let erstelltvon = (req.body.erstelltvon) ? req.body.erstelltvon : null;
    let rohkost = (req.body.rohkost) !== undefined ? req.body.rohkost : null;
    let vegan = (req.body.vegan) !== undefined ? req.body.vegan : null;
    let vegetarisch = (req.body.vegetarisch) !== undefined ? req.body.vegetarisch : null;
    let glutenfrei = (req.body.glutenfrei) !== undefined ? req.body.glutenfrei : null;

    const query = `INSERT INTO rezepte(name, anleitung, anzahlportionen, zubereitungszeitmin, erstelltvon, rohkost, vegan, vegetarisch, glutenfrei) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

    try {
        const result = await client.query(query, [
            name, anleitung, anzahlportionen, zubereitungszeitmin, erstelltvon, rohkost, vegan, vegetarisch, glutenfrei])
        console.log(result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).send('Fehler beim Einfügen des Rezepts');
    }
});

module.exports = router;