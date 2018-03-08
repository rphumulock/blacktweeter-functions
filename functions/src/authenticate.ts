import * as functions from 'firebase-functions';
import * as Twitter from 'twitter';
import * as fetch from 'node-fetch';

async function retrieveBearerToken(requestString: string): Promise<String> {
    const response = await fetch('https://api.twitter.com/oauth2/token', { method: 'POST', body: 'grant_type=client_credentials', headers: { 'Authorization': 'Basic ' + requestString, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } });
    const json = await response.json();
    //console.log('Response :' + json.access_token);
    return json.access_token;
};

async function authenticateTwitter(): Promise<Twitter> {
    const consumerKey = functions.config().twitter.ck;
    const consumerSecret = functions.config().twitter.cs;
    const requestString = consumerKey + ':' + consumerSecret;
    const tokenRequest = new Buffer(requestString).toString('base64');
    const bearerToken = await retrieveBearerToken(tokenRequest);
    //console.log('Bearer Token: ' + bearerToken);
    return new Twitter({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        bearer_token: bearerToken
    });
}

export default authenticateTwitter;