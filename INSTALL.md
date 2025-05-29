# Detailed installation instructions.

Follow these instructions to run the project locally. 

## Requirements 
- Node.js >22
- NPM
- An API key for Google's generative AI tools. Follow the instructions [here](https://ai.google.dev/gemini-api/docs/api-key) to get one of these.
- Knowledge of which model you want to use. If you're not sure, I suggest ``gemini-2.0-flash-lite-001``. Beware of rate limits!


## Instructions 
1. Clone the repository (`$ git clone`).
2. Install the dependencies using NPM (`$ npm i`).
3. Set up your dotfile:
   - Create a file in the root of the project called `.env`.
   - Copy the contents of `.env.example` into `.env`.
   - Replace ``your_gemini_api_key`` with your API key.
   - Replace ``your_gemini_model_code`` with the code for the model you want to use.
   - Set up your topics: 
      - If you want to use our suggested topics: leave TOPICS_PROMPT_LOCATION and TOPICS_LIST_LOCATION as they are.
      - If you want to use your own topics, point these at different files or edit topics_prompt.txt and topics.json. 
      - topics.json must be in the following format: 
      ``` 
{
   "Topic Group 1": ["Subtopic", "Subtopic"],
   "Topic Group 2": ["Subtopic", "Subtopic"]
}
      ```
4. Run `$ npm run fetch-data`. This will take a while the first time you run it - it fetches all the petitions on `petition.parliament.uk`. It then uses the AI to assign each petition a topic. Depending on your rate limit, this could take up to a few hours.
5. Once that has finished, run `$ npm run start`.
6. Navigate to `localhost:3000` in your browser. 
   - If you are hosting this somewhere other than localhost, you will need to update `API_STEM_URL` in `index.html` (at the bottom in the script tag).

## The docs 
The code is documented using jsDoc strings. To get these in a website, run `$ npm run build-docs`. 
