const utils = require("../service/utils");
const movie_service = require("../service/movie-service");

module.exports = function(controller) {

  controller.on('message_received', function(bot, message) {
    let msg = JSON.stringify(message);
    const action = utils.getAction(message);
    console.debug(`message:${msg}, action:${action}`);
    if(action === "get-movie-info" ){
      const params = utils.getParameters(message);
      const movieTitle = params.movie.toString();
      movie_service.getDetail(movieTitle).then((movie)=>{
        const text =`${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
        
        bot.reply(message, text);
      }).catch((error) =>{
        console.log(error);
      });
      return; 
    }

    bot.reply(message, {
      text:  'I do not know how to respond to that message yet.  Define new features by adding skills in my `skills/` folder.  [Read more about building skills](https://github.com/howdyai/botkit-starter-web/blob/master/docs/how_to_build_skills.md).\n\n(This message is from the unhandled_messages skill.)',
      quick_replies: [
          {
            title: 'Help',
            payload: 'help',
          },
        ]
    });    
  });

}