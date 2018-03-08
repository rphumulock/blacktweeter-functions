"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const authenticate_1 = require("./authenticate");
admin.initializeApp(functions.config().firebase);
/* Utility Functions */
function getTweet(twitter, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield twitter.get('statuses/show/', { id: id });
        return response;
    });
}
;
function getReplies(twitter, screenName, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryString = 'to:' + screenName + ', since_id:' + id;
        const encodeQueryString = encodeURIComponent(queryString);
        const response = yield twitter.get('search/tweets', { q: queryString });
        console.log(response.statuses.length);
        const replies = response.statuses.reduce((accum, status) => {
            if (status.in_reply_to_status_id_str != null && status.in_reply_to_status_id_str === id) {
                accum.push(status);
            }
            return accum;
        }, []);
        return replies;
    });
}
;
/* Topic Functions */
function createTopic(topic) {
    console.log('CREATE_TOPIC');
    return admin.database().ref('Topics').push({ Topic: topic });
}
;
/* Tweet Functions */
function createTweet(twitter, id, topic) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('CREATE_TWEET');
        const tweet = yield getTweet(twitter, id);
        const screenName = tweet.user.screen_name;
        const replies = yield getReplies(twitter, screenName, id);
        console.log(replies);
        return admin.database().ref(`Topics/${topic}/Tweets`).push({ Id: id, Tweet: tweet, Replies: replies });
    });
}
;
function deleteTweet(id, topic) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('DELETE_TWEET');
        admin.database().ref(`Topics/${topic}/Tweets`).child(id).remove();
    });
}
function deleteTopic(topic) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('DELETE_TOPIC');
        admin.database().ref(`Topics`).child(topic).remove();
    });
}
/* Listens for all requests */
exports.request = functions.database.ref('Requests/{pushId}')
    .onCreate((event) => __awaiter(this, void 0, void 0, function* () {
    try {
        const twitter = yield authenticate_1.default();
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
    }
    catch (error) {
        console.log('Error: ' + error);
    }
}));
//# sourceMappingURL=index.js.map