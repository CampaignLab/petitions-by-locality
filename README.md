# petitions-by-locality

This is a WIP project.

## How to install me

(See slightly more detailed instructions in INSTALL.md.)

1. Download (ie `$ git clone`). 
2. Install dependencies (`$ npm i`)
3. For the AI bits, create a `.env` file: 
    - GEMINI_API_KEY - your API key 
    - GEMINI_MODEL_CODE - the code for the model you want to use 
    - GEMINI_RATE_LIMIT - a rate limit you want to use. This is per minute. 
4. Run `$ npm fetch-data` in the root of the repo to fetch the data and associate petitions with topics. 
5. Run `$ npm start` and navigate to `localhost:3000`. 

If you want to build the docs using jsdoc, run `$ npm run build-docs.`

## How is the app structured?

The code should all be quite self-explanatory and mostly uses docsstrings. 

The structure of the app itself is: 

- scripts/ 
  - add_topics.js - uses an LLM to assign topics to petitions 
  - download_petitions.js - gets the petitions from the petitions.parliament.uk site 
  - fetch_data.js - runs all the other data getting/annotatating scripts. 
  - process_petitions.js - does the actual grouping by locality. 
- views/ contains the front end 
  - index.html - the app is a single-page app, all of which are viewed here. THere are three views: "by locality", which shows the petitions in a given locality and allows filtering; "by topics", which visualises the topics, and "about", which is static content with licences. 
  - scripts/ 
    - localities.js - calculates salience, handles the filtering and displaying petitions including their details. 
    - topics.js - visualises the petitions using charts.js. 
    - viewSwitcher.js - handles switching between views 
  - styles/ 
    - global.css - global styles 
    - localities.css - styles for localities view 
    - topics.css - styles for topics view 

## Acknowledgements / licences for data used


### Petitions data
Contains public sector information licensed under the Open Government Licence v3.0.

### List of topics assigned to petitions 

The list is manually pulled from [the topics page of the House of Commons Library](https://commonslibrary.parliament.uk/research/full-topic-list/). Two topics are removed: monthly economic indicators and economic indicators. 

Contains Parliamentary information licensed under the [Open Parliament Licence v3.0](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/). 

### Constituency boundaries 

They are the [Westminster Parliamentary Constituencies (July 2024) Boundaries UK BUC](geoportal.statistics.gov.uk/datasets/ef63f363ac824b79ae9670744fcc4307_0/) dataset. 

Source: Office for National Statistics licensed under the Open Government Licence v.3.0

Contains OS data © Crown copyright and database right 2024.

### Populations 

The population figures are calculated using the data from the [House of Commons library dashboard](https://commonslibrary.parliament.uk/constituency-statistics-population-by-age/).

Contains Parliamentary information licensed under the [Open Parliament Licence v3.0.](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/)

