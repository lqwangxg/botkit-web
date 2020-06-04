const movie_service = require("../service/movie-service");
const utils = require("../service/utils");

module.exports = function(controller) {

  controller.on('get-movie-info', function(bot, message) {
    const title = utils.getParameterValue(message,"movie");
    
    if(!title){
      bot.startConversation(message, function(err, convo) {
        //console.log(`convo:${JSON.stringify(convo)}`);
        // set up a menu thread which other threads can point at.
        convo.ask({
          text: '名称を教えて下さい。'
        });
      });
      return;
    }

    movie_service.getDetail(title).then(movie=>{
      
      onMovieBack(movie, bot, message);
    });
  });

  function onMovieBack(movie, bot, message){
    const text =`${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
    console.log(`movie=============:${JSON.stringify(movie)}`);
    console.log(`text=============:${text}`);
    const jsonBody = { 
      text: text, 
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
    bot.reply(message, text);
  }
  
}

