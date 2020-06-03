module.exports = function(controller) {

  controller.on('message_received', function(bot, message) {
    let msg = JSON.stringify(message);
    console.debug(`message:${msg}, action:${message.action}`);
    if(message.action === "get-movie-info" ){
      
      const movie = movie_service.getDetail(context.confirmed.movie.toString());
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
      bot.reply(message, JSON.stringify(jsonBody));
      return; 
    }

    bot.reply(message, {
        text: 'I do not know how to respond to that message yet.  Define new features by adding skills in my `skills/` folder.  [Read more about building skills](https://github.com/howdyai/botkit-starter-web/blob/master/docs/how_to_build_skills.md).\n\n(This message is from the unhandled_messages skill.)',
        quick_replies: [
            {
              title: 'Help',
              payload: 'help',
            },
          ]
    });

  });

}