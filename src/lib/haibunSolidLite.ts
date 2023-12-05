import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

import { IWebServer } from '@haibun/web-server-express/build/defs.js'
import { AStorage } from '@haibun/domain-storage/build/AStorage.js';
import { EMediaTypes, guessMediaType } from '@haibun/domain-storage/build/domain-storage.js';
import { getContentType } from "./mimeTypes.js"
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function setSolidLiteRoutes(app: IWebServer, storage: AStorage, dataDirectory: string) {
    app.use((req, res, next) => {
        setCorsHeaders(res) // Apply CORS headers to every response

        if (req.method === 'OPTIONS') {
            handleOptions(req, res) // Handle preflight OPTIONS requests
        } else {
            next() // Continue to other routes for non-OPTIONS requests
        }
    });

    /// / Define the options for express.static
    const options = {
        setHeaders: function (res, filePath, stat) { // Change 'path' to 'filePath' to avoid conflict with 'path' module
            // Serve files without an extension as 'text/html'
            if (!path.extname(filePath)) { // Use 'path.extname' method correctly on 'filePath'
                res.set('Content-Type', 'text/html')
            }
        }
    }

    app.checkAddStaticFolder(dataDirectory, '/', options);

    // Add middleware to protect routes
    const protectRoutes = (req, res, next) => {
        if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
            const apiKey = process.env.SOLID_API_KEY;

            if (apiKey) {
                const authHeader = req.headers.authorization;
                // Check if the Authorization header is present and formatted correctly
                if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
                    return res.status(401).send('Unauthorized');
                }
            } else {
                this.getWorld().logger.warn('No API key set. All requests are allowed.');
            }
        }
        next();
    }

    app.use(protectRoutes);

    // Ensure data directory exists
    storage.ensureDirExists(dataDirectory);
    const defaultFilePath = path.join(dataDirectory, 'profile.html') // Path for index.html in the data directory
    if (!storage.exists((defaultFilePath))) {
        // Copy profile.html to index.html if index.html does not exist
        const profile = readFileSync(path.join(__dirname, '..', '..', 'files', 'content', 'profile.html'), 'utf-8');
        storage.writeFile(defaultFilePath, profile, EMediaTypes.html);
    }

    function setCorsHeaders(res) {
        console.log('setCorsHeaders');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('X-Powered-By', 'haibun-solid-lite-0.0.1');
    }

    function handleOptions(req, res) {
        setCorsHeaders(res);
        console.log('preflight');
        res.status(204).end(); // No Content response for preflight requests
    }

    app.addKnownRoute('options', '*', (req, res) => {
        setCorsHeaders(res);
        res.status(204).end();
    });

    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} Request to ${req.originalUrl}`);
        console.log('Body:', req.body);
        next();
    });

    // CRUD operations

    // CREATE: Upload a new file
    app.addKnownRoute('post', '/data/:filename', (req, res) => {
        const { filename } = req.params;
        // FIXME should not need to parse since we are using express.json()
        const { data } = JSON.parse(req.body);
        const filePath = path.join(dataDirectory, filename);
        console.log('\nxxgg', data, req.body, filePath);
        storage.writeFile(filePath, data, guessMediaType(filename)).catch(err => {
            console.error('write', err);
            res.status(500).send('An error occurred while writing the file.');
            return;
        });
        res.status(201).send('File created successfully.');
    });

    // HEAD: Retrieve the headers of a file
    app.addKnownRoute('head', '/data/:filename', async (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);

        if (storage.exists(filePath)) {
            const lstat = await storage.lstatToIFile(filePath);

            // Get the file extension from the filename
            const ext = path.extname(filename);
            // Determine the content type
            const contentType = getContentType(ext);

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', lstat.size);
            res.setHeader('Last-Modified', new Date(lstat.created).getUTCDate());
            res.status(200).end();
        } else {
            res.status(404).send('File not found.');
        }
    });

    // READ: Get a list of files or a specific file
    app.addKnownRoute('get', '/:filename?', async (req, res) => {
        const { filename } = req.params;
        console.log('filename', filename);
        if (filename) {
            const filePath = path.join(dataDirectory, filename);
            if (storage.exists(filePath)) {
                const ext = path.extname(filename);
                const contentType = getContentType(ext);
                res.setHeader('Content-Type', contentType);
                const contents = storage.readFile(filePath);
                res.send(contents);
            } else {
                res.status(404).send('File not found.');
            }
        } else {
            const files = await storage.readdir(dataDirectory);
            res.json(files);
        }
    });

    // CREATE or UPDATE: Upload or update a file
    app.addKnownRoute('put', '/:filename', (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);

        try {
            storage.writeFile(filePath, req.body.content, guessMediaType(filename));
            res.send('File created/updated successfully.');
        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred while writing the file.');
        }
    });

    // DELETE: Delete a file
    app.addKnownRoute('delete', '/data/:filename', (req, res) => {
        console.log('hihi');
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);
        console.log('delete', filePath, storage.exists(filePath));
        if (storage.exists(filePath)) {
            storage.rm(filePath);
            res.send('File deleted successfully.');
        } else {
            res.status(404).send('File not found.');
        }
    });
}
