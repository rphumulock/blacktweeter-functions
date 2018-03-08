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
const Twitter = require("twitter");
const fetch = require("node-fetch");
function retrieveBearerToken(requestString) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('https://api.twitter.com/oauth2/token', { method: 'POST', body: 'grant_type=client_credentials', headers: { 'Authorization': 'Basic ' + requestString, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } });
        const json = yield response.json();
        //console.log('Response :' + json.access_token);
        return json.access_token;
    });
}
;
function authenticateTwitter() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumerKey = functions.config().twitter.ck;
        const consumerSecret = functions.config().twitter.cs;
        const requestString = consumerKey + ':' + consumerSecret;
        const tokenRequest = new Buffer(requestString).toString('base64');
        const bearerToken = yield retrieveBearerToken(tokenRequest);
        //console.log('Bearer Token: ' + bearerToken);
        return new Twitter({
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            bearer_token: bearerToken
        });
    });
}
exports.default = authenticateTwitter;
//# sourceMappingURL=authenticate.js.map