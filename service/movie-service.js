'use strict';

require("dotenv").config();

const request = require('request');
const debug = require("debug")("bot-express:service");

const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const URL_BASE = `http://www.omdbapi.com/?apikey=${MOVIE_API_KEY}`;

Promise = require('bluebird');
Promise.promisifyAll(request);


module.exports = class MovieService {

    static getDetail(movieTitle){
        let url = encodeURI(URL_BASE + "&t="+ movieTitle);
        let headers = {
            "Content-Type": "application/json"
        };
        return request.getAsync({
            url: url,
            headers: headers,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    return Promise.reject(new Error("MovieService.getDetail() failed."));
                }
                return response.body;
            }
        );
    }
}
