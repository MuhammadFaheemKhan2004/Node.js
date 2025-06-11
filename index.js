const http = require('http');
const url = require('url');
const fs = require('fs');
const app=require('express');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    if (req.url === '/favicon.ico') return res.end();

    // Serve Home Page
    if (method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    // Serve About Page with Form
    if (method === 'GET' && pathname === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
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
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Your name"
                                class="w-full px-4 py-2 border rounded"
                                required
                            />
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Your email"
                                class="w-full px-4 py-2 border rounded"
                                required
                            />
                            <input
                                type="text" 
                                name="message" 
                                placeholder="Your message"
                                class="w-full px-4 py-2 border rounded"
                                required
                            />
                            <button 
                                type="submit"
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Submit
                            </button>
                        </form>

                        <a href="/submissions" class="block mt-6 text-sm text-blue-500 hover:underline">View Submissions</a>
                    </div>
                </div> 
            </body>
            </html>
        `);
    }

    // Handle POST form submission
    if (method === 'POST' && pathname === '/submit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const params = new URLSearchParams(body);
            const name = params.get('name');
            const email = params.get('email');
            const message = params.get('message');

            if (!name || !email || !message) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('All fields are required');
            }

            const entry = `Name: ${name}, Email: ${email}, Message: ${message}\n`;
            fs.appendFile('./submissions.txt', entry, err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error saving submission');
                }

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Thanks</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body class="bg-green-50 text-gray-800">
                        <div class="min-h-screen flex items-center justify-center">
                            <div class="bg-white p-10 rounded shadow-lg max-w-md w-full text-center">
                                <h2 class="text-2xl font-bold text-green-600 mb-4">Thank you, ${name}!</h2>
                                <p class="text-gray-700 mb-2">We’ve saved your message.</p>
                                <a href="/about" class="text-blue-500 hover:underline text-sm">Back to Form</a>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
            });
        });
        return;
    }

    // Show Submissions
    if (method === 'GET' && pathname === '/submissions') {
        fs.readFile('./submissions.txt', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error reading submissions');
            }

            const rows = data.trim().split('\n').map(line => {
                const [name, email, message] = line.split(', ').map(pair => pair.split(': ')[1]);
                return `<tr class="border-b"><td class="px-4 py-2">${name}</td><td class="px-4 py-2">${email}</td><td class="px-4 py-2">${message}</td></tr>`;
            }).join('');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html><head><title>Submissions</title><script src="https://cdn.tailwindcss.com"></script></head>
                <body class="bg-gray-100 text-gray-800">
                    <div class="min-h-screen flex flex-col items-center justify-center p-10">
                        <h1 class="text-3xl font-bold text-blue-600 mb-6">Submitted Messages</h1>
                        <table class="bg-white shadow-md rounded w-full max-w-4xl text-left">
                            <thead class="bg-blue-100">
                                <tr><th class="px-4 py-2">Name</th><th class="px-4 py-2">Email</th><th class="px-4 py-2">Message</th></tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <a href="/about" class="mt-6 text-blue-500 hover:underline text-sm">← Back to Form</a>
                        <a href="/clear-submissions" class="mt-2 text-red-500 hover:underline text-sm">🗑️ Clear All Submissions</a>
                    </div>
                </body></html>
            `);
        });
        return;
    }

    // Clear Submissions
    if (method === 'GET' && pathname === '/clear-submissions') {
        fs.writeFile('./submissions.txt', '', err => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error clearing data');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html><head><title>Cleared</title><script src="https://cdn.tailwindcss.com"></script></head>
                <body class="bg-yellow-50 text-gray-800">
                    <div class="min-h-screen flex items-center justify-center">
                        <div class="bg-white p-10 rounded shadow-lg max-w-md w-full text-center">
                            <h2 class="text-2xl font-bold text-yellow-600 mb-4">All submissions have been cleared.</h2>
                            <a href="/about" class="text-blue-500 hover:underline text-sm">← Back to Form</a>
                        </div>
                    </div>
                </body></html>
            `);
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
});

server.listen(8000, () => {
    console.log('Server listening on port 8000');
});
