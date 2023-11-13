import { fileURLToPath } from 'url';
import { mimeTypes } from "./mimeTypes.js";
import path, { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export function setSolidLiteRoutes(app, storage, dataDirectory) {
    app.use((req, res, next) => {
        setCorsHeaders(res); // Apply CORS headers to every response
        if (req.method === 'OPTIONS') {
            handleOptions(req, res); // Handle preflight OPTIONS requests
        }
        else {
            next(); // Continue to other routes for non-OPTIONS requests
        }
    });
    // Serve static files from the data directory at the root URL
    //
    /// / Define the options for express.static
    const options = {
        setHeaders: function (res, filePath, stat) {
            // Serve files without an extension as 'text/html'
            if (!path.extname(filePath)) { // Use 'path.extname' method correctly on 'filePath'
                res.set('Content-Type', 'text/html');
            }
        }
    };
    app.checkAddStaticFolder(dataDirectory, '/', options);
    // Add middleware to protect routes
    const protectRoutes = (req, res, next) => {
        if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
            const authHeader = req.headers.authorization;
            const apiKey = process.env.SOLID_API_KEY;
            // Check if the Authorization header is present and formatted correctly
            if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
                return res.status(401).send('Unauthorized');
            }
        }
        next();
    };
    app.use(protectRoutes);
    // Ensure data directory exists
    storage.ensureDirSync(dataDirectory);
    const defaultFilePath = path.join(dataDirectory, 'index.html'); // Path for index.html in the data directory
    if (!storage.existsSync(defaultFilePath)) {
        // Copy profile.html to index.html if index.html does not exist
        storage.copySync(path.join(__dirname, 'profile.html'), defaultFilePath);
    }
    const getContentType = (ext) => {
        return mimeTypes[ext] || 'text/html';
    };
    function setCorsHeaders(res) {
        console.log('setCorsHeaders');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('X-Powered-By', 'solid-lite-0.0.1');
    }
    function handleOptions(req, res) {
        setCorsHeaders(res);
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
        const filePath = path.join(dataDirectory, filename);
        storage.outputFileSync(filePath, req.body.content);
        res.status(201).send('File created successfully.');
    });
    // HEAD: Retrieve the headers of a file
    app.addKnownRoute('head', '/data/:filename', (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);
        if (storage.existsSync(filePath)) {
            storage.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('An error occurred while retrieving the file info.');
                }
                // Get the file extension from the filename
                const ext = path.extname(filename);
                // Determine the content type
                const contentType = getContentType(ext);
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Length', stats.size);
                res.setHeader('Last-Modified', stats.mtime.toUTCString());
                res.status(200).end();
            });
        }
        else {
            res.status(404).send('File not found.');
        }
    });
    // READ: Get a list of files or a specific file
    app.addKnownRoute('get', '/:filename?', (req, res) => {
        const { filename } = req.params;
        console.log('filename', filename);
        if (filename) {
            const filePath = path.join(dataDirectory, filename);
            if (storage.existsSync(filePath)) {
                // Get the file extension from the filename
                const ext = path.extname(filename);
                // Determine the content type
                const contentType = getContentType(ext);
                console.log('Content-Type', contentType);
                res.setHeader('Content-Type', contentType);
                res.sendFile(filePath);
            }
            else {
                res.status(404).send('File not found.');
            }
        }
        else {
            const files = storage.readdirSync(dataDirectory);
            res.json(files);
        }
    });
    // CREATE or UPDATE: Upload or update a file
    app.addKnownRoute('put', '/:filename', (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);
        storage.outputFile(filePath, req.body, err => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred while writing the file.');
            }
            else {
                res.send('File created/updated successfully.');
            }
        });
    });
    // DELETE: Delete a file
    app.addKnownRoute('delete', '/:filename', (req, res) => {
        const { filename } = req.params;
        const filePath = path.join(dataDirectory, filename);
        if (storage.existsSync(filePath)) {
            storage.removeSync(filePath);
            res.send('File deleted successfully.');
        }
        else {
            res.status(404).send('File not found.');
        }
    });
}
//# sourceMappingURL=haibunSolidLIte.js.map