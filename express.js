const http = require('http');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
    res.send('Welcome to the Home Page  ' + req.query.name);
});
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
                <div class="bg-white p

const server = http.createServer(app);  10 rounded shadow-lg max-w-md w-full text-center">  
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
                            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `);

});
const myserver = http.createServer(app);
app.listen(8000, () => {
    console.log('Server listening on port 8000');
});
