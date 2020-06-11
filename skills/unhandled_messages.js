const utils = require("../service/utils");
const IntentService = require("../service/intent");

module.exports = function(controller) {

  //ユーザからのメッセージを解析
  controller.on('message_received', function(bot, message) {
    //センターの場合、処理終了
    if(message.user.match(/admin/i)) return;
    
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
      bot.startConversation(message, function(err, convo) {
        convo.ask({
          text: 'ご入力内容['+ message.text +']に理解できません。人工応答に切り替わりますか？',
          //type:'input.unknown',
          quick_replies: [
            {
              title: 'はい',
              payload: 'はい'
            },
            {
              title: 'いいえ',
              payload: 'いいえ'
            }
          ]
        },
        [
          {
            pattern: 'はい',
            callback: function(res, convo) {
              convo.say({text:"人工応答に替ります、少々お待ち下さい！", transferSkip: true});

              //人工応答へ送信
              let msg = {
                text : `[${message.user}]様のご質問「 ${message.text} 」に回答をお願いいたします。`,
                user: "admin",
                callbackUser: message.user,
                askHuman: true
              };
              controller.transferMessageToCenter(bot, msg);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(res, convo) {
              utils.helpDesk(convo);
              convo.next();
            }
          }
        ]);
  
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
  

  //センターからのメッセージを解析、基本は転送するだけ。
  //controller.hears('.*', 'message_received', function(bot, message) {
  controller.on('message_received', function(bot, message) {
    //センターの場合、処理終了
    if(!message.user.match(/admin/i)) return;

    console.log(`==============センターからのメッセージ===================`, message);
    bot.startConversation(message, function(err, convo) {
      convo.ask({
        text: 'ご回答内容['+ message.text +']をそのまま['+ message.callbackUser +']ユーザへお返しますか？',
        quick_replies: [
          {
            title: 'はい',
            payload: 'はい'
          },
          {
            title: 'いいえ',
            payload: 'いいえ'
          }
        ]
      },
      [
        {
          pattern: 'はい',
          callback: function(res, convo) {
            //人工応答へ送信
            let msg = {
              text : message.text,
              user: message.callbackUser,
              answerUser: true
            };
            controller.transferMessage (msg, message.callbackUser);
            convo.say({text:"ユーザ様に返答しました。", transferSkip: true});
            convo.next();
          }
        },
        {
          default: true,
          callback: function(res, convo) {
            utils.helpDesk(convo);
            convo.next();
          }
        }
      ]);

    });
     
  });
}