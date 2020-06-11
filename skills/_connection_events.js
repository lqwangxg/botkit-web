/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
module.exports = function(controller) {
  
  //初回接続、再度接続、途中helpの場合、ヘルプディスクへmessage_received
  controller.on('hello', onboarding);
  controller.on('welcome_back', onboarding);
  
  controller.on('conversationStarted', function(bot, convo) {
    console.log(`A conversation started with ${convo.context.user}.`);
  });
  controller.on('conversationEnded', function(bot, convo) {
    console.log(`A conversation end with ${convo.context.user}.`);
  });
  
  controller.hears(['help','ヘルプ'], 'message_received', onboarding);
  
  function onboarding(bot, message) {
    console.log(`onboarding :${message.type}, ${message.user} `);

    if(!bot.user)bot.user = message.user;
    //ONLINE CLIENTの登録
    const found = controller.botClients.find(element => bot.user === element.user);
    if(!found){
      controller.botClients.push(bot);
    }
    
    bot.startConversation(message, function(err, convo) {
      const header='こんにちは、MBP Smartec ロボです。 ';
      
      if(message.user.match(/admin/i)){
        //message.text = 'Admin Management Center is online...';
        //message.typingDelay=1000;
        //convo.say('Admin Management Center is online...');
      }else{
        utils.helpDesk(convo, header);
      }
      
    });

  }

}
