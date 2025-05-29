import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

import { fetchAllPetitions } from './download_petitions.js';
import { main as extractTopics } from './add_topics.js';
import mainProcessPetitions from './process_petitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const allPetitionsPath = path.join(dataDir, 'all_petitions.json');
const constituenciesDataPath = path.join(dataDir, 'constituencies_data.json');
const topicsByPetitionPath = path.join(dataDir, 'topics_by_petition.json');
const savedTopicsPath = path.join(dataDir, 'SAVED_topics_by_petition.json');

/**
 * The main function to fetch all petitions and process them. 
 * This should probably be scheduled to run eg once a day.
 */
async function main() {
    console.log("See about for information about data sources and licences.")
    const args = process.argv.slice(2);
    const shouldExtractTopics = args.includes('--extract_topics');
    // New option: if --use_local_petitions is present, skip fetching new petitions.
    const shouldUseLocalPetitions = args.includes('--use_local_petitions');

    await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
    
    // Conditionally call fetchAllPetitions based on the new option
    if (!shouldUseLocalPetitions) {
        await fetchAllPetitions(allPetitionsPath).catch(console.error);
    } else {
        console.log("Using local petitions, skipping fetchAllPetitions.");
    }
    
    await mainProcessPetitions(constituenciesDataPath).catch(console.error);

    if (shouldExtractTopics) {
        console.log("Starting topic extraction...");
        await extractTopics(topicsByPetitionPath, savedTopicsPath).catch(console.error);
    }
}

main();