# Twitch Vod Stats API

## Front-end repo for site found here: 

https://github.com/DrySoldier/twitch-vod-stats

## How to use: 

1.) Endpoint for API is found here: https://ngo9nlp0nf.execute-api.us-east-1.amazonaws.com/dev

If the API is abused in any way their may be API key limits set on it in the future. For now, it is free to use by anyone.

2.) To get your vod chatlog and some extra info: Add your vod id at the end of the URL to create the vod info, add `/vods/${vodID}` to see the info

So your URL to create it would be `https://ngo9nlp0nf.execute-api.us-east-1.amazonaws.com/dev/VODID`, and the URL to see it once it is loading would be `https://ngo9nlp0nf.execute-api.us-east-1.amazonaws.com/dev/vods/VODID`

## Dependecies

    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^7.0.0",
    "express": "^4.16.4",
    "mongoose": "^5.5.4",
    "serverless-http": "^2.0.1",
    "serverless-offline": "^4.9.4",
    "twitch-api-v5": "^2.0.4",
    "twitch-chatlog": "^6.1.0"

## Contributing

Simply make a pull request.
