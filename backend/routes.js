const express = require('express');
const router = express.Router();
const client = require('./db');

// GET all recipes
router.get('/rezepte', async(req, res) => {
    const query = `SELECT * FROM rezepte`;

    try {
        const result = await client.query(query)
        console.log(result)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
        res.status(500).send('Fehler beim Abrufen der Rezepte');
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
    let name = req.body.name || null;
    let passwort = req.body.passwort || null;

    const query = `INSERT INTO users(name, passwort) VALUES ($1, $2) RETURNING *`;

    try {
        const result = await client.query(query, [name, passwort])
        console.log(result)
        res.send(result.rows[0]);
    } catch (err) {
        console.log(err.stack);
        res.status(500).send("Internal Server Error");
    }
});


// POST one recipe
router.post('/newrecipe', async(req, res) => {


    const {
        name,
        anleitung,
        anzahlportionen,
        zubereitungszeitmin,
        erstelltvon, //ein integer (benutzer id)
        rohkost,
        vegan,
        vegetarisch,
        glutenfrei,
        zutaten // hier ist die verbindung zur tabelle beinhaltet, ein array mit zutaten_id und menge
    } = req.body;

    const rezeptQuery = `
        INSERT INTO rezepte(name, anleitung, anzahlportionen, zubereitungszeitmin, erstelltvon, rohkost, vegan, vegetarisch, glutenfrei) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;

    const beinhaltetQuery = `
        INSERT INTO beinhaltet (zutaten_id, rezepte_id, menge) VALUES ($1, $2, $3)
    `;

    try {
        await client.query('BEGIN');
        const result = await client.query(rezeptQuery, [
            name, anleitung, anzahlportionen, zubereitungszeitmin, erstelltvon, rohkost, vegan, vegetarisch, glutenfrei])
        const rezeptId = result.rows[0].id;

        if (Array.isArray(zutaten) && zutaten.length > 0) {

            for (const zutat of zutaten) {
                const { zutaten_id, menge } = zutat;

                // Sicherheits-Check, um zu überprüfen, dass die Zutaten-ID existiert
                const checkZutat = await client.query('SELECT id FROM zutaten WHERE id = $1', [zutaten_id]);
                if (checkZutat.rows.length === 0) {
                    throw new Error(`Zutat mit ID ${zutaten_id} existiert nicht!`);
                }

                await client.query(beinhaltetQuery, [zutaten_id, rezeptId, menge]);
            }
        }

        await client.query('COMMIT'); // Transaktion abschließen
        res.status(201).json({ message: "Rezept erfolgreich erstellt!", rezeptId });

    } catch (err) {
        await client.query('ROLLBACK'); // Falls ein Fehler passiert, alles zurücksetzen
        console.error(err.stack);
        res.status(500).send(`Fehler beim Einfügen des Rezepts: ${err.message}`);
    }
});


// UPDATE recipe - dynamisch,sodass nur geänderte werte gespeichert werden, aber egal welche werte, sonst brauchen wir mehree update methoden

router.put('/recipe/:id', async (req, res) => {
    const { id } = req.params;
    const { anleitung, zutaten } = req.body;

    try {
        // Falls nur die Anleitung aktualisiert werden soll
        if (anleitung) {
            await client.query('UPDATE rezepte SET anleitung = $1 WHERE id = $2', [anleitung, id]);
        }

        // Falls Zutaten aktualisiert werden sollen
        if (zutaten && Array.isArray(zutaten)) {
            for (const zutat of zutaten) {
                const { zutaten_id, menge } = zutat;
                await client.query(
                    'UPDATE beinhaltet SET menge = $1 WHERE rezepte_id = $2 AND zutaten_id = $3',
                    [menge, id, zutaten_id]
                );
            }
        }

        res.status(200).json({ message: 'Rezept erfolgreich aktualisiert!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Rezepts' });
    }
});


//Test:

router.post('/test', express.json(), (req, res) => {
    console.log("Test-Route wurde aufgerufen!");
    res.send("Route funktioniert!");
});

// DELETE one specific recipe
router.delete('/rezepte/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // zuerst alle Beziehungen zu Zutaten löschen
        await client.query('DELETE FROM beinhaltet WHERE rezepte_id = $1', [id]);

        // dann das Rezept selbst löschen
        await client.query('DELETE FROM rezepte WHERE id = $1', [id]);

        res.status(200).json({ message: 'Rezept erfolgreich gelöscht!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fehler beim Löschen des Rezepts' });
    }
});

// GET one specific user
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `SELECT * FROM users WHERE id = $1`;
        const result = await client.query(query, [id]);
        if (result.rows.length > 0) {
            res.send(result.rows[0]);
        } else {
            res.status(404).send('Benutzer nicht gefunden');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Abrufen des Benutzers');
    }
});

// UPDATE passwort from one user -- HIER NOCH UTF8 FEHLER
router.put('/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).send('Passwort ist erforderlich');
        return;
    }

    try {
        const query = `UPDATE users SET passwort = $1 WHERE id = $2 RETURNING *`;
        const result = await client.query(query, [password, id]);
        if (result.rows.length > 0) {
            res.send({ message: 'Passwort erfolgreich geändert' });
        } else {
            res.status(404).send('Benutzer nicht gefunden');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Ändern des Passworts');
    }
});

module.exports = router;