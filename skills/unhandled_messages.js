const utils = require("../service/utils");
const IntentService = require("../service/intent");
const debug = require('debug')('botkit:handle');

module.exports = function(controller) {

  controller.on('message_received', function(bot, message) {
    
    //let intentResponse;
    IntentService.detectTextIntent([message.text],(intentResponse)=>{
      console.log(`message===before======:${JSON.stringify(message)}`);
      Object.assign(message, intentResponse);
      console.log(`message===after======:${JSON.stringify(message)}`);

      const action = utils.getAction(message);
      const fulfillmentText = utils.getfulfillmentText(message);
      if(action){
        const handler = controller.handlers.find(e => e.name === action);
        if(handler){
          console.log(`handler:${handler.name}, action:${action}`);
          controller.trigger(handler.name, [bot, message]);
          return;
        }
        
        controller.handlers.forEach(a=>{
          console.log(`item:${a}`);
        });

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