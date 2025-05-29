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

We use the list of most important issues on pages 15-26 of the [British Election Study 2014-2024 Combined Waves 1-29 Internet Panel Cookbook](https://www.britishelectionstudy.com/wp-content/uploads/2024/09/Bes_wave29Documentationv29.0.pdf). 

Accessed 29/05/2025.

Citation: Fieldhouse, E., J. Green, G. Evans, J. Mellon, C. Prosser, J. Bailey, R. de Geus, H. Schmitt, C. van der Eijk, J. Griffiths, & S. Perrett. (2024) British Election Study Internet Panel Waves 1-29. DOI: 10.5255/UKDA-SN-8202-2
Scientific Leadership Team: Professor Ed Fieldhouse, Professor Geoff Evans, Dr Jonathan Mellon, Dr Christopher Prosser. Supported by Dr Jack Bailey, Dr James Griffiths, Dr Stuart Perrett. 

Topics are assigned using an LLM, which we prompt with a  slightly modified version of pages 15-24 of that document. 

### Constituency boundaries 

They are the [Westminster Parliamentary Constituencies (July 2024) Boundaries UK BUC](geoportal.statistics.gov.uk/datasets/ef63f363ac824b79ae9670744fcc4307_0/) dataset. 

Source: Office for National Statistics licensed under the Open Government Licence v.3.0

Contains OS data © Crown copyright and database right 2024.

### Populations 

The population figures are calculated using the data from the [House of Commons library dashboard](https://commonslibrary.parliament.uk/constituency-statistics-population-by-age/).

Contains Parliamentary information licensed under the [Open Parliament Licence v3.0.](https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/)

