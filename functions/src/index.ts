import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
import authenticateTwitter from './authenticate';

admin.initializeApp(functions.config().firebase);

/* Utility Functions */
async function getTweet(twitter: Twitter, id: string): Promise<Twitter> {
    const response = await twitter.get('statuses/show/', { id: id });
    return response;
};

async function getReplies(twitter: Twitter, screenName: string, id: string): Promise<Twitter> {
    const queryString = 'to:' + screenName + ', since_id:' + id;
    const encodeQueryString = encodeURIComponent(queryString);
    const response = await twitter.get('search/tweets', { q: queryString });
    console.log(response.statuses.length);
    const replies = response.statuses.reduce((accum, status) => {
        if (status.in_reply_to_status_id_str != null && status.in_reply_to_status_id_str === id) {
            accum.push(status);
        }
        return accum;
    }, []);
    return replies;
};

/* Topic Functions */
function createTopic(topic: string) {
    console.log('CREATE_TOPIC');
    return admin.database().ref('Topics').push({ Topic: topic });
};

/* Tweet Functions */
async function createTweet(twitter: Twitter, id: string, topic: string) {
    console.log('CREATE_TWEET');
    const tweet = await getTweet(twitter, id);
    const screenName = tweet.user.screen_name;
    const replies = await getReplies(twitter, screenName, id);
    console.log(replies);
    return admin.database().ref(`Topics/${topic}/Tweets`).push({ Id: id, Tweet: tweet, Replies: replies });
};

async function deleteTweet(id: string, topic: string) {
    console.log('DELETE_TWEET');
    admin.database().ref(`Topics/${topic}/Tweets`).child(id).remove();
}

async function deleteTopic(topic: string) {
    console.log('DELETE_TOPIC');
    admin.database().ref(`Topics`).child(topic).remove();
}

/* Listens for all requests */
exports.request = functions.database.ref('Requests/{pushId}')
    .onCreate(async (event) => {
        try {
            const twitter = await authenticateTwitter();
            const data = event.data.val();
            const requestType = data.type;
            event.data.ref.remove();
            switch (requestType) {
                case 'CREATE_TOPIC':
                    return createTopic(data.topic.toUpperCase());
                case 'CREATE_TWEET':
                    return createTweet(twitter, data.id, data.topic);
                case 'DELETE_TOPIC':
                    return deleteTopic(data.topic);
                case 'DELETE_TWEET':
                    return deleteTweet(data.id, data.topic);
                default:
                    return null;
            }
        } catch (error) {
            console.log('Error: ' + error);
        }
    });