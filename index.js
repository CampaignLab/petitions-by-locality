import express from 'express';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import https from 'https';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command-line flag
const args = process.argv.slice(2);
const useS3 = args.includes('--use-s3');

// S3 URLs
const constituenciesDataURL = 'https://petitions-by-locality-bucket.s3.eu-west-2.amazonaws.com/data/constituencies_data.json';
const topicsDataURL = 'https://petitions-by-locality-bucket.s3.eu-west-2.amazonaws.com/data/topics_by_petition.json';

const viewsPath = path.join(__dirname, 'public');
app.use(express.static(viewsPath));

// Serve home page
app.get('/', (req, res) => {
    res.sendFile(path.join(viewsPath, 'index.html'));
});

// Conditionally stream constituencies data
app.get('/constituenciesData', (req, res) => {
    if (useS3) {
        https.get(constituenciesDataURL, (s3Res) => {
            if (s3Res.statusCode !== 200) {
                res.status(s3Res.statusCode).send(`Failed to fetch data: ${s3Res.statusCode}`);
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            s3Res.pipe(res);
        }).on('error', (err) => {
            res.status(500).send(`Error fetching data from S3: ${err.message}`);
        });
    } else {
        const localPath = path.join(__dirname, 'data', 'constituencies_data.json');
        res.sendFile(localPath);
    }
});

// Conditionally stream topics data
app.get('/topicsData', (req, res) => {
    if (useS3) {
        https.get(topicsDataURL, (s3Res) => {
            if (s3Res.statusCode !== 200) {
                res.status(s3Res.statusCode).send(`Failed to fetch topics data: ${s3Res.statusCode}`);
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            s3Res.pipe(res);
        }).on('error', (err) => {
            res.status(500).send(`Error fetching topics data from S3: ${err.message}`);
        });
    } else {
        res.sendFile(path.join(__dirname, 'data', 'topics_by_petition.json'));
    }
});

// Always use local CSV
app.get('/constituencyPopulations', (req, res) => {
    const populations = {};
    fs.createReadStream(path.join(__dirname, 'constant_data', 'constituency_populations.csv'))
        .pipe(csv())
        .on('data', data => {
            const constituency = data[Object.keys(data)[0]];
            const pop = data[Object.keys(data)[1]];
            populations[constituency] = pop;
        })
        .on('end', () => {
            res.send(populations);
        });
});

// Always use local topics hierarchy
app.get('/topicsHierarchy', (req, res) => {
    res.sendFile(path.join(__dirname, 'constant_data', 'topics.json'));
});

// Always use local constituency boundaries
app.get('/constituencyBoundaries', (req, res) => {
    res.sendFile(path.join(__dirname, 'constant_data', 'Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BUC_4872633423108313063.geojson'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`
Petitions by Locality running on port ${port}.
${useS3 ? 'Using S3 for constituencies and topics data.' : 'Using local data.'}
`);
    });
}

// Export for Vercel
export default app;