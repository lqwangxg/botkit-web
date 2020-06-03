const utils = require("../service/utils");
const movie_service = require("../service/movie-service");

module.exports = function movie_handler(bot, message) {
  const params = utils.getParameters(message);
  const movieTitle = params.movie.toString();
  movie_service.getDetail(movieTitle).then((movie)=>{
    const text =`${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
    bot.reply(message, {
      text: text,
      fulfillmentText: text,
      fulfillmentMessages: [
        {
          text: {
            text: [text]
          }
        }]
    });
  }).catch((error) =>{
    console.log(error);
  });
}