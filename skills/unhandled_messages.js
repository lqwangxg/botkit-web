module.exports = function(controller) {

  controller.hears(['Default Welcome Intent'], 'direct_message', function(bot, message) {
    replyText = message.fulfillment.text;  // message object has new fields added by Dialogflow
    bot.reply(message, replyText);
    console.log(`controller.hears message:${message}`);
  });
  
  controller.on('message_received', function(bot, message) {
    console.log(message);
    console.log(`intent:${message.intent}`);
    
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