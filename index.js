const http = require('http');
const url = require('url');
const fs = require('fs');

const myserver = http.createServer((req, res) => {
    if (req.url === '/favicon.ico') return res.end();

    const myurl = url.parse(req.url, true);
    console.log('Parsed URL:', myurl);

    switch (myurl.pathname) {
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello from Server');
            break;

        case '/about':
            res.writeHead(200, { 'Content-Type': 'text/html' });

            const name = myurl.query.name;
            const email = myurl.query.email;
            const message = myurl.query.message;

            const htmlResponse = `
    <!DOCTYPE html>
   <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
   </head>
 <body class="bg-gray-100 text-gray-800">
    <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-10 rounded shadow-lg max-w-md w-full text-center">
            <h1 class="text-2xl font-bold text-blue-600 mb-4">
                ${name ? `👋 Hello, ${name}!` : '👋 Welcome to the About Page'}
            </h1>

            ${email ? `<p class="text-gray-700 mb-2">📧 Email: ${email}</p>` : ''}
            ${message ? `<p class="text-gray-700 mb-4">💬 Message: ${message}</p>` : ''}

            <p class="mb-6 text-gray-600">Enter your details below to get a personalized greeting.</p>

            <form method="GET" action="/submit" class="space-y-4">
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

            <a href="/" class="block mt-6 text-sm text-blue-500 hover:underline">Back to Home</a>
        </div>
    </div> 
  </body>
  </html>
   `;
            res.end(htmlResponse);
            break;

        case '/submit':
            const { name: n, email: e, message: m } = myurl.query;

            const entry = `Name: ${n}, Email: ${e}, Message: ${m}\n`;

            fs.appendFile('./submissions.txt', entry, (err) => {
                if (err) {
                    console.error('Error saving submission:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>Thank You</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                        </head>
                        <body class="bg-green-50 text-gray-800">
                            <div class="min-h-screen flex items-center justify-center">
                                <div class="bg-white p-10 rounded shadow-lg max-w-md w-full text-center">
                                    <h2 class="text-2xl font-bold text-green-600 mb-4">Thank you, ${n}!</h2>
                                    <p class="text-gray-700 mb-2">We’ve saved your message.</p>
                                    <a href="/about" class="text-blue-500 hover:underline text-sm">Back to Form</a>
                                </div>
                            </div>
                        </body>
                        </html>
                    `);
                }
            });
            break;

        case '/contact':
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Contact Page');
            break;
        case '/submissions':
            fs.readFile('./submissions.txt', 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error reading submissions.');
                }

                // Split lines and build rows
                const rows = data.trim().split('\n').map(line => {
                    const [namePart, emailPart, messagePart] = line.split(', ');
                    const name = namePart?.split(': ')[1] || '';
                    const email = emailPart?.split(': ')[1] || '';
                    const message = messagePart?.split(': ')[1] || '';
                    return `<tr class="border-b">
                        <td class="px-4 py-2">${name}</td>
                        <td class="px-4 py-2">${email}</td>
                        <td class="px-4 py-2">${message}</td>
                    </tr>`;
                }).join('');

                // Full HTML
                const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Submissions</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 text-gray-800">
            <div class="min-h-screen flex flex-col items-center justify-center p-10">
                <h1 class="text-3xl font-bold text-blue-600 mb-6">Submitted Messages</h1>
                <table class="bg-white shadow-md rounded w-full max-w-4xl text-left">
                    <thead class="bg-blue-100">
                        <tr>
                            <th class="px-4 py-2">Name</th>
                            <th class="px-4 py-2">Email</th>
                            <th class="px-4 py-2">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
                <a href="/about" class="mt-6 text-blue-500 hover:underline text-sm"> ← Back to Form</a>
            </div>
        </body>
        </html>
        `;

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            });
            break;


        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Page Not Found');
    }
});

// Basic log (optional)
const log = `${Date.now()} - Server started\n`;

fs.appendFile('./log.txt', log, (err) => {
    if (err) console.error('Error writing to log file:', err);
    else console.log('Log entry added successfully');
});

myserver.listen(8000, () => {
    console.log('Server is listening on port 8000');
});
