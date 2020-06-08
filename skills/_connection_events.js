/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
module.exports = function(controller) {
  
  //初回接続、再度接続、途中helpの場合、ヘルプディスクへ
  controller.on('hello', onboarding);
  controller.on('welcome_back', onboarding);
  controller.hears(['help','ヘルプ'], 'message_received', onboarding);

  function onboarding(bot, message) {
    console.log('onboarding ================> message:', message);

    bot.startConversation(message, function(err, convo) {
      const header='こんにちは、MBP Smartec ロボです。 ';
      utils.helpDesk(convo, header);
    });
  }
  
}
