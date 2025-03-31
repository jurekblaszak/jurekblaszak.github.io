const fs = require('fs');
const path = require('path');

// Wczytaj plik .env
const envContent = fs.readFileSync('.env', 'utf8');
const apiKey = envContent
    .split('\n')
    .find(line => line.startsWith('GEMINI_API_KEY='))
    ?.split('=')[1]
    ?.trim();

if (!apiKey) {
    console.error('API key not found in .env file');
    process.exit(1);
}

// Przygotuj zawartość config.js
const configContent = `const API_KEY = '${apiKey}';

async function getApiKey() {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
        throw new Error('API key not configured');
    }
    return API_KEY;
}`;

// Zapisz do pliku config.js
fs.writeFileSync('config.js', configContent);
console.log('Config file updated successfully'); 