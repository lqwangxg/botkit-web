/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
module.exports = function(controller) {

  controller.hears(/^iot関連$/, 'message_received', function(bot, message) {

    bot.startConversation(message, function(err, convo) {
              //console.log(`convo:${JSON.stringify(convo)}`);
      // set up a menu thread which other threads can point at.
      convo.ask({
        text: 'iot関連情報を選べます。',
        quick_replies: [
          {
            title: 'iot案例資料',
            payload: 'iot案例資料',
          },
          {
            title: 'iot関連団体',
            payload: 'iot関連団体',
          },{ 
            title: 'その他',
            payload: 'その他',
          }
        ]
      },
      [
        {
          pattern: /^iot案例資料$/i,
          callback: function(res, convo) {
            convo.gotoThread('docs');
            convo.next();
          }
        },
        {
          pattern: 'iot関連団体',
          callback: function(res, convo) {
            convo.gotoThread('community');
            convo.next();
          }
        },
        {
          default: true,
          callback: function(res, convo) {
            //convo.gotoThread('end');
            convo.next();
          }
        }
      ]);

      // set up docs threads
      convo.addMessage({
        text: '[Iot案例資料 ](http://112.126.67.102:30006/news/)',
      },'docs');
      
      convo.addMessage({
        action: 'default'
      }, 'docs');
      
      // set up community thread
      convo.addMessage({
        text: '[一般社団法人AI・IoT普及推進協会](https://www.aipa.jp/)',
      },'community');

      convo.addMessage({
        text: '[組み込みシステム技術協会](https://www.jasa.or.jp/tech/iotm2m/)',
      },'community');

      convo.addMessage({
        text: '[経済産業省、情報化・情報産業](https://www.meti.go.jp/policy/mono_info_service/joho/index.html)',
      },'community');

      convo.addMessage({
        action: 'default'
      }, 'community');
      utils.helpDesk(convo);
    });
    
  });
  
  controller.hears(['会社案内','電話番号','所在地','アクセス'], 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      // set up community thread
      convo.say({
        text: '[弊社の会社案内](http://mbpsmartec.co.jp/company/)',
      });
      utils.helpDesk(convo);
    });
  });
  controller.hears('事業内容', 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      // set up community thread
      convo.say({
        text: '[弊社の事業内容紹介へ](http://mbpsmartec.co.jp/business/)',
      });
      utils.helpDesk(convo);
    });
  });
  controller.hears('最新ニュース', 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      // set up community thread
      convo.say({
        text: '[弊社の最新ニュース](http://mbpsmartec.co.jp/news/)',
      });
      utils.helpDesk(convo);
    });
  });

  controller.hears('ログイン', 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.ask({
        text: '会員様、一般社員を選び頂きます。',
        quick_replies: [
          {
            title: '会員様',
            payload: '会員様',
          },
          {
            title: '一般社員',
            payload: '一般社員',
          }
        ]
      },
      [
        {
          pattern: '会員様',
          callback: function(res, convo) {
            convo.gotoThread('member');
            convo.next();
          }
        },
        {
          pattern: '一般社員',
          callback: function(res, convo) {
            convo.gotoThread('staff');
            convo.next();
          }
        },
        {
          default: true,
          callback: function(res, convo) {
            convo.next();
          }
        }
      ], {key: 'loginType'});

      const callBackAskID=[
        {
          pattern : /^S\w+/,
          callback: (message, convo) => {
            convo.say(`ようこそ、いらっしゃいません。${message.text}様！`)
            convo.next();
          }
        },
        {
          pattern : /^M\w+/,
          callback: (message, convo) => {
            convo.say(`こんにちは、${message.text}様！`)
            convo.next();
          }
        },
        {
          default:true,
          callback: (message, convo) => {
            convo.next();
          }
        }
      ];

      // set up member threads
      convo.addQuestion({
        text: '会員様IDを入力してください。',
      }, callBackAskID, {key: 'name'}, "member");
      
      // set up staff threads
      convo.addQuestion({
        text: '社員IDを入力してください。',
      }, callBackAskID, {key: 'name'}, "staff");
    
    });
  });

}
