const utils = require("../service/utils");
const IntentService = require("../service/intent");

module.exports = function(controller) {

  //
  controller.on('USR_MSG', function(bot, message) {

    console.log(`message==before detectTextIntent====`, message);
    
    IntentService.detectTextIntent([message.text], (ret)=>{
      Object.assign(message, ret);
      
      const action = utils.getAction(message);
      const fulfillmentText = utils.getfulfillmentText(message);
      if(action){
        const handler = controller.handlers.find(e => e.name === action);
        if(handler){
          console.log(`handler:${handler.name}, action:${action}`);
          controller.trigger(handler.name, [bot, message]);
          return;
        }
      }else if(fulfillmentText){
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
      }else{
        bot.reply(message, {
          text: '＝＝＝＝＝意味不明処理＝＝＝＝＝',
          quick_replies: [
              {
                title: 'Help',
                payload: 'help',
              },
            ]
        });
      }
      
    });

  });
  

}