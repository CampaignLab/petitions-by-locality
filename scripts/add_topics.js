import fs from 'fs';
import dotenv from 'dotenv';
import Bottleneck from 'bottleneck';
import { GoogleGenAI } from '@google/genai';
import cliProgress from 'cli-progress';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_RATE_LIMIT = parseInt(process.env.GEMINI_RATE_LIMIT, 10);
const GEMINI_MODEL_CODE = process.env.GEMINI_MODEL_CODE;

const TOPICS_PROMPT_LOCATION = process.env.TOPICS_PROMPT_LOCATION;
const TOPICS_LIST_LOCATION = process.env.TOPICS_LIST_LOCATION;

// Initialize the GoogleGenAI client with the API key
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Rate limiter using RPM (requests per minute)
const limiter = new Bottleneck({
  minTime: Math.ceil(60000 / GEMINI_RATE_LIMIT),
  maxConcurrent: 1,
});


/**
 * Loads the topics list and prompt specified in the environment variables TOPICS_PROMPT_LOCATION and TOPICS_LIST_LOCATION.
 * The topics list should be two-tier in the format: {"Topic group": ["Topic 1", "Topic 2"], "Topic Group": [...]}
 * @returns {Object} topicsContainer - An object containing the topics list and the prompt text.
 * @throws {Error} If TOPICS_PROMPT_LOCATION or TOPICS_LIST_LOCATION are not defined, or if file reading/parsing fails.
 */
function loadTopicsPromptAndHierarchy() {
  if (!TOPICS_PROMPT_LOCATION) {
    throw new Error('TOPICS_PROMPT_LOCATION environment variable is not set.');
  }
  if (!TOPICS_LIST_LOCATION) {
    throw new Error('TOPICS_LIST_LOCATION environment variable is not set.');
  }

  let topicsPrompt = '';
  let topicsList = {};

  try {
    // Load the topics prompt
    topicsPrompt = fs.readFileSync(TOPICS_PROMPT_LOCATION, 'utf-8');
  } catch (error) {
    console.error(`Error loading topics prompt from ${TOPICS_PROMPT_LOCATION}:`, error.message);
    throw new Error(`Failed to load topics prompt: ${error.message}`);
  }

  try {
    // Load and parse the topics list
    const rawTopicsList = fs.readFileSync(TOPICS_LIST_LOCATION, 'utf-8');
    topicsList = JSON.parse(rawTopicsList);
  } catch (error) {
    console.error(`Error loading or parsing topics list from ${TOPICS_LIST_LOCATION}:`, error.message);
    throw new Error(`Failed to load or parse topics list: ${error.message}`);
  }

  return { topicsPrompt, topicsList };
}

/**
 * Makes a request to the Gemini API.
 * @param {Array<Object>} prompt - The prompt array for the Gemini model.
 * @returns {Promise<string>} The generated text from the Gemini model.
 */
async function makeGeminiRequest(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_CODE,
      contents: prompt,
    });

    // Extract the generated text from response
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text found in Gemini API response");
    }

    return text;
  } catch (error) {
    console.error("Error making Gemini API request:", error);
    throw error;
  }
}

const filePath = './data/constituencies_data.json';

/**
 * Loads petitions data from a specified JSON file.
 * @param {string} file - The path to the JSON file containing petitions data.
 * @returns {Object} The parsed JSON object containing petitions data.
 */
function loadPetitions(file) {
  try {
    const rawData = fs.readFileSync(file, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to load petitions:', err.message);
    return {};
  }
}

/**
 * Loads previously saved petition topics from a specified JSON file.
 * @param {string} filepath - The path to the JSON file containing saved petition topics.
 */
function loadSavedPetitionTopics(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      console.warn('Saved topics file does not exist. Skipping.');
      return {};
    }
    const rawData = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to load saved petition topics:', err.message);
    return {};
  }
}

// Wrap the LLM request function with the rate limiter
const LLMWrapper = limiter.wrap(async function (prompt) {
  return await makeGeminiRequest(prompt);
});

/**
 * Extracts the topic of a petition using an LLM.
 * @param {Object} petition - The petition object - the schema is from petitions.parliament.uk.
 * @param {Object} savedPetitionsObject - An object containing previously saved topics for petitions.
 * @param {string} topicsPrompt - The base prompt text for topic extraction.
 * @param {Object} topicsList - An object containing a two-tier hierarchy of topics.
 */
async function extractTopic(petition, savedPetitionsObject, topicsPrompt, topicsList) {
  if (savedPetitionsObject && petition.id in savedPetitionsObject) {
    // console.log(`Petition ${petition.id} already has a topic: ${savedPetitionsObject[petition.id]}`);
    return savedPetitionsObject[petition.id];
  }

  const consolidatedDescriptionText =
    `Desired action:\n${petition.attributes.action}\n` +
    `Background:\n${petition.attributes.background}\n` +
    `Additional details:\n${petition.attributes.additional_details}\n`;


  const promptText = `${topicsPrompt}

${consolidatedDescriptionText}

Please provide the topic and nothing else:`;

  const finalPrompt = [{ text: promptText }];
  const petitionTopic = await LLMWrapper(finalPrompt);
  return petitionTopic.trim();
}

/**
 * Main function to process petitions, extract topics, and save them.
 * @param {string} outputPath - The path where the topics by petition will be saved.
 * @param {string} [savedPetitionTopicsPath=null] - The path to previously saved petition topics, if any. Use this to ensure chaching, so you don't need to make 5000 llm requests every time you update.
 */
async function main(outputPath, savedPetitionTopicsPath = null) {
  // Load the topics prompt and hierarchy once at the beginning
  const { topicsPrompt, topicsList } = loadTopicsPromptAndHierarchy();
  // console.log('Loaded Topics Prompt:', topicsPrompt); // Uncomment for debugging
  // console.log('Loaded Topics List:', topicsList);     // Uncomment for debugging


  let savedPetitionTopics = {};

  if (savedPetitionTopicsPath) {
    savedPetitionTopics = loadSavedPetitionTopics(savedPetitionTopicsPath);
  }

  const petitions = loadPetitions(filePath);
  let topicsByPetition = {};
  let counter = 0;

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  const total = Object.keys(petitions.rawPetitionsData).length;
  progressBar.start(total, 0);

  for (const key of Object.keys(petitions.rawPetitionsData)) {
    counter += 1;
    progressBar.update(counter);

    const petition = petitions.rawPetitionsData[key];
    // Pass the loaded topicsPrompt and topicsList to extractTopic
    const petitionTopic = await extractTopic(petition, savedPetitionTopics, topicsPrompt, topicsList);

    const petitionID = petition.id;
    topicsByPetition[petitionID] = petitionTopic;

    fs.writeFileSync(outputPath, JSON.stringify(topicsByPetition, null, 2), 'utf-8');
    // console.log(`Processed petition ${petitionID}: ${petitionTopic}`);
  }

  progressBar.stop();
  console.log("All petitions processed.");

  // Updated SAVED_topics_by_petition.json
  if (savedPetitionTopicsPath == null) {
    savedPetitionTopicsPath = './data/SAVED_topics_by_petition.json';
  }
  fs.writeFileSync(savedPetitionTopicsPath, JSON.stringify(topicsByPetition, null, 2), 'utf-8', (err) => {
    if (err) console.error(`Could not save topics to ${savedPetitionTopicsPath}:`, err);
  });

}

// Export the main function
export { main };

// const outputPathForTopics = './data/topics_by_petition.json';
// const savedTopicsPathForRun = './data/SAVED_topics_by_petition.json';
// main(outputPathForTopics, savedTopicsPathForRun).catch(console.error);

