const utils = require("../service/utils");
const IntentService = require("../service/intent");

module.exports = function(controller) {

  //
  controller.on('USR_MSG', function(bot, message) {

    console.log(`message==before detectTextIntent====`, message);
    IntentService.detectTextIntent([message.text], (ret)=>{
      Object.assign(message, ret);
      
      const action = utils.getAction(message);
      if(action){
        const handler = controller.handlers.find(e => e.name === action);
        if(handler){
          console.log(`handler:${handler.name}, action:${action}`);
          controller.trigger(handler.name, [bot, message]);
          return;
        }
      }
      const fulfillmentText = utils.getfulfillmentText(message);
      if(fulfillmentText){
        bot.reply(message, {
          text: fulfillmentText,
          fulfillmentText: fulfillmentText,
          quick_replies: [
              {
                title: 'Help',
                payload: 'help',
              },
          ]
        });
        return;
      }
      bot.reply(message, {
        text: 'ご入力内容['+ message.text +']に理解できません。人工受付に切り替わります。しばらくを待ちください。',
        quick_replies: [
            {
              title: 'Help',
              payload: 'help',
            },
          ]
      });

    }, (error)=>{
      console.log(error);
      bot.reply(message, {
        text: '['+ err　+']のエラーが発生しました、対応中です。しばらくを待ちください。',
        quick_replies: [
            {
              title: 'Help',
              payload: 'help',
            },
          ]
      });
    });
     
  });
  

}