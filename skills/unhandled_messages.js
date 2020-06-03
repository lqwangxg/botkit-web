const utils = require("../service/utils");

module.exports = function(controller) {

  controller.on('message_received', function(bot, message) {
    const msg = JSON.stringify(message);
    const action = utils.getAction(message);
    console.debug(`message:${msg}, action:${action.name}`);
    
    const found = controller.handlers.find(element => element.action === action.name);
    if(found){
      found(bot, message);
      return;
    }

    //======================================================
    // input.unknown handler.
    bot.reply(message, {
      text:  'I do not know how to respond to that message yet. Define new features by adding skills in my `skills/` folder.  [Read more about building skills](https://github.com/howdyai/botkit-starter-web/blob/master/docs/how_to_build_skills.md).\n\n(This message is from the unhandled_messages skill.)',
      quick_replies: [
          {
            title: 'Help',
            payload: 'help',
          },
        ]
    });    
  });
  

}