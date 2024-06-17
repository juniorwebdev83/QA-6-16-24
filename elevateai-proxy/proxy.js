// proxy.js
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

// Enable CORS middleware
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.use('/api', (req, res) => {
    const url = 'https://api.elevateai.com' + req.url;
    const options = {
        url: url,
        method: req.method,
        headers: {
            'X-API-TOKEN': '4c90d090-0115-4fed-9546-d5f446b4459b', // Replace with your actual API token
            'Content-Type': req.headers['content-type']
        },
        json: true
    };

    if (req.method === 'POST' || req.method === 'PUT') {
        options.body = req.body;
    }

    // Pipe the request to ElevateAI API and pipe the response back to the client
    req.pipe(request(options)).pipe(res);
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Proxy server is running on port ${port}`);
});
