import fs from 'fs';

const START_URL = 'https://petition.parliament.uk/petitions.json?state=all';

/**
 *  Helper function to fetch JSON data from a URL. 
* @param {string} url - The URL to fetch data from.
*/
async function fetchJson(url) {
    // fetch is globally available in Node.js v18+ in ES module context
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.json();
}
/**
 * Fetch all the petitions from the UK Parliament petitions API and save them to a file.
 * @param {*} outputPath 
 */
async function fetchAllPetitions(outputPath) {
    let url = START_URL;
    const allPetitions = [];
    let count = 0;

    console.log(`Fetching petitions. This may take a while.\nCounter updates every 5.`);

    while (url) {
        const listPage = await fetchJson(url);
        const petitions = listPage.data;

        for (const petition of petitions) {
            const detailUrl = petition.links?.self;
            if (!detailUrl) continue;

            try {
                const detail = await fetchJson(detailUrl);

                // todo: filtering
                allPetitions.push(detail.data);

                count++;
                if (count % 5 == 0) process.stdout.write(`\rProcessed petitions: ${count}`);
            } catch (err) {
                console.error(`Failed to fetch petition detail: ${detailUrl}`, err.message);
            }
        }

        url = listPage.links?.next || null;
    }

    process.stdout.write('\n'); // move to next line after done

    fs.writeFileSync(outputPath, JSON.stringify(allPetitions, null, 2), 'utf-8');
    console.log(`✅ All petitions saved to ${outputPath}`);
}

export { fetchAllPetitions }; // Export the new function using ES module syntax
// Run the script (if you want to run it directly, uncomment below)
// fetchAllPetitions().catch(console.error);