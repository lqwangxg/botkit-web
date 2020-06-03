const movie_service = require("../service/movie-service");

module.exports = function(controller) {

  controller.hears('movie-intent','get-movie-info', function(bot, message) {
    const movie = await movie_service.getDetail(context.confirmed.movie.toString());
    const text =`${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
    
    const jsonBody = { 
      "fulfillmentText": text,
      "payload": {
        "google": {
          "expectUserResponse": true,
          "richResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": text
                }
              }
            ]
          }
        }
      }
    };
    bot.reply(message, jsonBody);

  });
}

