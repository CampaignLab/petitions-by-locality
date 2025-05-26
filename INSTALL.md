# Detailed installation instructions.

Follow these instructions to run the project locally. These are a slightly expanded version of the instructions in the README.

## Requirements 
- Node.js >22
- NPM
- An API key for Google's generative AI tools. Follow the instructions [here](https://ai.google.dev/gemini-api/docs/api-key) to get one of these.
- Knowledge of which model you want to use. If you're not sure, I suggest ``gemma-3-27b-it``.

## Instructions 
1. Clone the repository (`$ git clone`).
2. Install the dependencies using NPM (`$ npm i`).
3. Set up your dotfile:
   - Create a file in the root of the project called `.env`.
   - Copy the contents of `.env.example` into `.env`.
   - Replace ``your_gemini_api_key`` with your API key.
   - Replace ``your_gemini_model_code`` with the code for the model you want to use.
   - Save the file.
4. Run `$ npm run fetch-data`. This will take a while the first time you run it - it fetches all the petitions on `petition.parliament.uk`. It then uses the AI to assign each petition a topic. Depending on your rate limit, this could take up to a few hours.
5. Once that has finished, run `$ npm run start`.
6. Navigate to `localhost:3000` in your browser.

## The docs 
The code is documented using jsDoc strings. To get these in a website, run `$ npm run build-docs`. 
