# petitions-by-locality

This is a WIP project.

## How to install me

1. Download (ie `$ git clone`). 
2. Install dependencies (`$ npm i`)
3. For the AI bits, create a `.env` file: 
    - GEMINI_API_KEY - your API key 
    - GEMINI_MODEL_CODE - the code for the model you want to use 
    - GEMINI_RATE_LIMIT - a rate limit you want to use. This is per minute. 
4. Run `$ npm fetch-data` to fetch the data and associate petitions with topics. 
  - TODO: at the moment, this does not cache topics, so you will need to do this manually by creating SAVED_topics_by_petition.json - this is to be fixedASAP. 
5.  Run `$npm start` and navigate to `localhost:3000`. 

## TODOs:
- Weight constituencies by population, not 1/650 (population might be population or registered voters) DONE
- Implelement proper topics caching non-manually 
- Move on to AWS? 
- Do things with the topics data 
    - Topics dashboard ideas: which topics are popular where? (ie on a map) DONE
    - Click into a topic - what petitions have been created with this topic over time? DONE
    - how salient is a given topic in your constituency NOT DONE
    - do topics vary by salience etc in different areas (I'm sure they do) NOT DONE
    - other interesting questions?
    - Parliamntary boundaries GeoJSON: https://www.data.gov.uk/dataset/90293fcf-9268-4a1a-be3d-d4a20d314604/westminster-parliamentary-constituencies-july-2024-names-and-codes-in-the-uk-v2

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

