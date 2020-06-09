/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
module.exports = function(controller) {
  
  //初回接続、再度接続、途中helpの場合、ヘルプディスクへ
  controller.on('hello', onboarding);
  controller.on('welcome_back', onboarding);
  controller.hears(['help','ヘルプ'], 'USR_MSG', onboarding);
  
  controller.on('conversationStarted', function(bot, convo) {
    console.log(`A conversation started with ${convo.context.user}.`);
  });
  controller.on('conversationEnded', function(bot, convo) {
    console.log(`A conversation end with ${convo.context.user}.`);
  });
  
  controller.on('MMC_MSG', function(bot, message) {
    
    bot.startConversation(message, function(err, convo) {
      convo.say(`message.type:${message.type}, from ${message.user},  text:${message.text}`);
      convo.addMessage(message, message.user);
    });
    
  });
  
  controller.on('USR_MSG', function(bot, message) {
    
    bot.startConversation(message, function(err, convo) {
      convo.say(`message.type:${message.type}, from ${message.user},  text:${message.text}`);
      convo.addMessage(message, message.user);      
      controller.trigger("MMC_MSG", [bot, message]);
    });

  });
  

  function onboarding(bot, message) {
    console.log(`onboarding :${message.type}, ${message.user} `);

    bot.startConversation(message, function(err, convo) {
      const header='こんにちは、MBP Smartec ロボです。 ';
      
      if(message.user.match(/admin/i)){
        convo.say({text:'Admin Management Center is online...'})
      }else{
        utils.helpDesk(convo, header);
      }
    });
  }

}
