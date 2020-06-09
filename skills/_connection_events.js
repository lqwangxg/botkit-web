/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
module.exports = function(controller) {
  
  //初回接続、再度接続、途中helpの場合、ヘルプディスクへ
  controller.on('hello', onboarding);
  controller.on('welcome_back', onboarding);
  controller.hears(['help','ヘルプ'], 'message_received', onboarding);

  function onboarding(bot, message) {
    console.log(`onboarding :${message.type}, ${message.user.id} `);
    //controller.trigger('broadcast', [bot, message]);

    bot.startConversation(message, function(err, convo) {
      const header='こんにちは、MBP Smartec ロボです。 ';
      utils.helpDesk(convo, header);
    });
  }

  /*
  controller.on(['broadcast'], onBroadcasting);
  function onBroadcasting(bot, message) {
    console.log(`onBroadcasting :${message.type}, ${message.user.id} `);
  }
  */
  controller.on('conversationStarted', function(bot, convo) {
    //var username = convo.context.user.name ? convo.context.user.name : convo.context.user.id;
    console.log(`A conversation started with ${convo.context.user}.`);
  });
  controller.on('conversationEnded', function(bot, convo) {
    //var username = convo.context.user.name ? convo.context.user.name : convo.context.user.id;
    console.log(`A conversation end with ${convo.context.user}.`);
  });
  
  controller.on('message_received', function(bot, message) {
    
  });

}
