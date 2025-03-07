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

// POST register new user
router.post('/users', async(req, res) => {
    let { name, passwort } = req.body;
    console.log('Registrierungsversuch für:', name); // Logging

    if (!name || !passwort) {
        console.log('Fehlende Eingaben'); // Logging
        return res.status(400).json({ message: "Benutzername und Passwort sind erforderlich" });
    }

    // Überprüfe Passwortanforderungen
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwort)) {
        return res.status(400).json({ message: "Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Ziffer und ein Sonderzeichen enthalten" });
    }

    try {
        // Überprüfe, ob der Benutzer bereits existiert
        const userCheck = await client.query('SELECT * FROM users WHERE name = $1', [name]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Benutzername bereits vergeben' });
        }

        // Füge den neuen Benutzer hinzu
        const query = `INSERT INTO users(name, passwort) VALUES ($1, $2) RETURNING id, name`;
        const result = await client.query(query, [name, passwort]);

        res.status(201).json({
            message: "Benutzer erfolgreich registriert",
            user: { id: result.rows[0].id, name: result.rows[0].name }
        });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ message: "Fehler bei der Registrierung" });
    }
});



// POST one recipe
router.post('/neuesrezept', async(req, res) => {

    const {
        name,
        anleitung,
        anzahlportionen,
        zubereitungszeitmin,
        rohkost,
        vegan,
        vegetarisch,
        glutenfrei,
        zutaten // hier ist die verbindung zur tabelle beinhaltet, ein array mit zutaten_id und menge
    } = req.body;

    const erstelltvon = req.user.id; // Benutzer-ID aus der sitzung

    // Validierung Eingabedaten von user
    if (!name || !anleitung || !anzahlportionen || !zubereitungszeitmin || !erstelltvon || zutaten === undefined) {
        return res.status(400).json({ message: "Alle erforderlichen Felder müssen ausgefüllt werden!" });
    }

    if (anzahlportionen <= 0) {
        return res.status(400).json({ message: "Anzahl der Portionen muss größer als 0 sein!" });
    }

    //hier sql an die datenbank
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
        const rezeptId = result.rows[0].id; // fur die id des neuen rezepts, zählt weiter

        //überprüfen ob array zutaten gültig ist, muss arraywert über null haben
        if (Array.isArray(zutaten) && zutaten.length > 0) {

            for (const zutat of zutaten) {
                const { zutaten_id, menge } = zutat;

                // Validierung der Zutateneingaben
                if (!zutaten_id || !menge) {
                    throw new Error("Interner Fehler (Mengenangabe oder ID der Zutat falsch!");
                }

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

router.put('/rezepte/:id', async (req, res) => {
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

// GET one specific user by id
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `SELECT * FROM users WHERE id = $1`;
        const result = await client.query(query, [id]);
        if (result.rows.length > 0) {
            res.send(result.rows[0]);
        } else {
            res.status(404).send('Benutzer*in nicht gefunden');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Abrufen der Benutzer*in');
    }
});



// UPDATE passwort from one user
router.put('/users/:id/passwort', async (req, res) => {
    const { id } = req.params;
    const { passwort } = req.body;

    if (!passwort) {
        res.status(400).send('Passwort ist erforderlich');
        return;
    }

    try {
        const query = `UPDATE users SET passwort = $1 WHERE id = $2 RETURNING *`;
        const result = await client.query(query, [passwort, id]);
        if (result.rows.length > 0) {
            res.send({ message: 'Passwort erfolgreich geändert' });
        } else {
            res.status(404).send('Benutzer*in nicht gefunden');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Ändern des Passworts');
    }
});

// POST login route
router.post('/user/login', async (req, res) => {
    const { name, passwort } = req.body;

    try {
        const userQuery = 'SELECT * FROM users WHERE name = $1 AND passwort = $2';
        const result = await client.query(userQuery, [name, passwort]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Ungültige Anmeldeinformationen' });
        }

        const user = result.rows[0];

        res.json({
            message: 'Login erfolgreich',
            userId: user.id,
            name: user.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfehler beim Login' });
    }
});

module.exports = router;