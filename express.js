const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const dataFile = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]');
}

app.use(express.urlencoded({ extended: true }));

// Helper functions to simplify file read/write
function readSubmissions(callback) {
    fs.readFile(dataFile, 'utf8', (err, data) => {
        if (err) return callback([]);
        try {
            const submissions = JSON.parse(data);
            callback(submissions);
        } catch (e) {
            callback([]);
        }
    });
}

function writeSubmissions(data, callback) {
    fs.writeFile(dataFile, JSON.stringify(data, null, 2), callback);
}

// ========== HOME ROUTE ==========
app.get('/', (req, res) => {
    res.send('Welcome to the Home Page  ' + req.query.name);
});

// ========== ABOUT PAGE WITH FORM ==========
app.get('/about', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>About</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 text-gray-800">
            <div class="min-h-screen flex items-center justify-center">
                <div class="bg-white p-10 rounded shadow-lg max-w-md w-full text-center">  
                    <h1 class="text-2xl font-bold text-blue-600 mb-4">👋 Welcome to the About Page</h1>
                    <p class="mb-6 text-gray-600">Enter your details below to get a personalized greeting.</p>
                    <form method="POST" action="/submit" class="space-y-4">
                        <input type="text" name="name" placeholder="Your name" class="w-full px-4 py-2 border rounded" required />
                        <input type="email" name="email" placeholder="Your email" class="w-full px-4 py-2 border rounded" required />
                        <input type="text" name="message" placeholder="Your message" class="w-full px-4 py-2 border rounded" required />
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Submit</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `);
});

// ========== SUBMIT FORM (SAVE TO JSON) ==========
app.post('/submit', (req, res) => {
    const { name, email, message } = req.body;
    const newEntry = { name, email, message };

    readSubmissions((submissions) => {
        submissions.push(newEntry);
        writeSubmissions(submissions, (err) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.send(`Thank you ${name} for your message: "${message}". We will contact you at ${email}.`);
        });
    });
});

// ========== INFO PAGE (SHOW JSON DATA + FILTER) ==========
app.get('/info', (req, res) => {
    const { name, email } = req.query;
    readSubmissions((submissions) => {
        if (name) submissions = submissions.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
        if (email) submissions = submissions.filter(e => e.email.toLowerCase().includes(email.toLowerCase()));

        const formattedEntries = submissions.map((entry, index) => `
            <div class="bg-white p-4 rounded shadow mb-4">
                <h2 class="text-lg font-bold text-blue-600 mb-2">Submission ${index + 1}</h2>
                <p><strong>Name:</strong> ${entry.name}</p>
                <p><strong>Email:</strong> ${entry.email}</p>
                <p><strong>Message:</strong> ${entry.message}</p>
                <div class="mt-2 space-x-4">
                    <a class="text-blue-500" href="/edit/${index}">✏️ Edit</a>
                    <a class="text-red-500" href="/delete/${index}" onclick="return confirm('Are you sure?')">🗑️ Delete</a>
                </div>
            </div>
        `).join('');

        res.type('html').send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Submissions</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100 p-8">
                <h1 class="text-3xl font-bold text-center mb-6">📬 All Form Submissions</h1>
                <form method="GET" action="/info" class="mb-6 text-center space-x-2">
                    <input type="text" name="name" placeholder="Filter by name" class="px-4 py-2 border rounded"/>
                    <input type="text" name="email" placeholder="Filter by email" class="px-4 py-2 border rounded"/>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Filter</button>
                </form>
                <div class="max-w-2xl mx-auto">
                    ${formattedEntries || `<p class="text-center text-gray-500">No entries found.</p>`}
                </div>
            </body>
            </html>
        `);
    });
});

// ========== DELETE ==========
app.get('/delete/:index', (req, res) => {
    const index = parseInt(req.params.index);
    readSubmissions((submissions) => {
        if (isNaN(index) || index < 0 || index >= submissions.length) {
            return res.status(400).send('Invalid index');
        }
        submissions.splice(index, 1);
        writeSubmissions(submissions, (err) => {
            if (err) return res.status(500).send('Error deleting entry');
            res.redirect('/info');
        });
    });
});

// ========== EDIT FORM ==========
app.get('/edit/:index', (req, res) => {
    const index = parseInt(req.params.index);
    readSubmissions((submissions) => {
        if (isNaN(index) || index < 0 || index >= submissions.length) {
            return res.status(400).send('Invalid index');
        }
        const entry = submissions[index];
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><script src="https://cdn.tailwindcss.com"></script></head>
            <body class="p-10 bg-gray-100">
                <form method="POST" action="/edit/${index}" class="space-y-4 bg-white p-6 rounded shadow max-w-md mx-auto">
                    <input type="text" name="name" value="${entry.name}" required class="w-full px-4 py-2 border rounded"/>
                    <input type="email" name="email" value="${entry.email}" required class="w-full px-4 py-2 border rounded"/>
                    <input type="text" name="message" value="${entry.message}" required class="w-full px-4 py-2 border rounded"/>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Update</button>
                </form>
            </body>
            </html>
        `);
    });
});

// ========== UPDATE EDITED DATA ==========
app.post('/edit/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const { name, email, message } = req.body;
    readSubmissions((submissions) => {
        if (isNaN(index) || index < 0 || index >= submissions.length) {
            return res.status(400).send('Invalid index');
        }
        submissions[index] = { name, email, message };
        writeSubmissions(submissions, (err) => {
            if (err) return res.status(500).send('Error updating entry');
            res.redirect('/info');
        });
    });
});

// ========== EXTRA ROUTE ==========
app.get('/mianwali', (req, res) => {
    res.type('html');
    res.send('<h1>I am from Mianwali, the land of beautiful people</h1>');
});

// ========== START SERVER ==========
app.listen(8000, () => {
    console.log('Server listening on port 8000');
});
