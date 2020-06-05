/* This module kicks in if no Botkit Studio token has been provided */

module.exports = function(controller) {

    controller.on('hello', conductOnboarding);
    controller.on('welcome_back', conductOnboarding);
    
    function conductOnboarding(bot, message) {

      bot.startConversation(message, function(err, convo) {
        const header='こんにちは、MBP Smartec ロボです。 ';
        helpDesk(convo, header);
      });

    }
    
    function helpDesk(convo, headText){
      let typingDelay = 0;
      if(!headText){
        headText="他に";
        typingDelay = 5000;
      }
      convo.say({
        text: `${headText}お問い合わせ内容をどうぞ`,
        typingDelay: typingDelay,
        quick_replies: [
          {
            title: 'iot関連',
            payload: 'iot関連',
          },
          {
            title: 'bigdata関連',
            payload: 'bigdata関連',
          },
          {
            title: '会社案内',
            payload: '会社案内',
          },{
            title: '事業内容',
            payload: '事業内容',
          },{
            title: '最新ニュース',
            payload: '最新ニュース',
          }
        ]
      });
    }

    controller.hears('iot', 'message_received', function(bot, message) {

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
            pattern: 'iot案例資料',
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
           
        helpDesk(convo);
      });
      
    });
    
    controller.hears(['help','ヘルプ'], 'message_received', function(bot, message) {
      conductOnboarding(bot, message);
    });

    controller.hears(['会社案内','電話番号','所在地','アクセス'], 'message_received', function(bot, message) {
      bot.startConversation(message, function(err, convo) {
        // set up community thread
        convo.say({
          text: '[弊社の会社案内](http://mbpsmartec.co.jp/company/)',
        });
        helpDesk(convo);
      });
    });
    controller.hears('事業内容', 'message_received', function(bot, message) {
      bot.startConversation(message, function(err, convo) {
        // set up community thread
        convo.say({
          text: '[弊社の事業内容紹介へ](http://mbpsmartec.co.jp/business/)',
        });
        helpDesk(convo);
      });
    });
    controller.hears('最新ニュース', 'message_received', function(bot, message) {
      bot.startConversation(message, function(err, convo) {
        // set up community thread
        convo.say({
          text: '[弊社の最新ニュース](http://mbpsmartec.co.jp/news/)',
        });
        helpDesk(convo);
      });
    });

}
