/* This module kicks in if no Botkit Studio token has been provided */

module.exports = function(controller) {

    controller.on('hello', conductOnboarding);
    controller.on('welcome_back', conductOnboarding);

    function conductOnboarding(bot, message) {

      bot.startConversation(message, function(err, convo) {

        convo.say({
          text: 'こんにちは、MBP SMARTEC ChatBotです。ご関心内容を選んでください。\n自由入力も可能です。',
          quick_replies: [
            {
              title: '連絡方式',
              payload: 'contact',
            },
            {
              title: '関連団体',
              payload: 'community',
            },
            {
              title: '案例紹介',
              payload: 'documentation',
            },
            {
              title: 'Iot',
              payload: 'iot',
            },
            {
              title: 'ITサービス',
              payload: 'ITService',
            },
            {
              title: 'その他',
              payload: 'help',
            },
          ]
        });

      });

    }

    controller.hears(['help','iot','^IT\s*(サービス|Service)$','contact','documentation','docs','community'], 
      'message_received', function(bot, message) {

      bot.startConversation(message, function(err, convo) {
        //console.log(`convo:${JSON.stringify(convo)}`);
        // set up a menu thread which other threads can point at.
        convo.ask({
          text: '類別の選択、または直接入力してください',
          quick_replies: [
            {
              title: '案例資料',
              payload: 'documentation',
            },
            {
              title: '関連団体',
              payload: 'community',
            },
            {
              title: 'ご連絡',
              payload: 'contact us',
            },
            {
              title: 'iot関連情報',
              payload: 'iot',
            },
            {
              title: 'ITサービス情報',
              payload: 'ITService',
            }
          ]
        },
        [
          {
            pattern: 'documentation',
            callback: function(res, convo) {
              convo.gotoThread('docs');
              convo.next();
            }
          },
          {
            pattern: 'community',
            callback: function(res, convo) {
              convo.gotoThread('community');
              convo.next();
            }
          },
          {
            pattern: 'contact',
            callback: function(res, convo) {
              convo.gotoThread('contact');
              convo.next();
            }
          },
          {
            pattern: 'iot',
            callback: function(res, convo) {
              convo.gotoThread('iot');
              convo.next();
            }
          },
          {
            pattern: 'ITService',
            callback: function(res, convo) {
              convo.gotoThread('ITService');
              convo.next();
            }
          },
          {
            default: true,
            callback: function(res, convo) {
              convo.gotoThread('end');
            }
          }
        ]);

        // set up docs threads
        convo.addMessage({
          text: 'helpを入力して、再度ご質問を聞かせてください。'
        },'end');
                
        // set up docs threads
        convo.addMessage({
          text: '[総合案例資料 ](http://112.126.67.102:30006/news/)',
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

        // set up contact thread
        convo.addMessage({
          text: '弊社の連絡方式：\n\n〒101‐0052\n 東京都千代田区神田小川町3－22　第三大丸ビル4階\n.TEL:03-6275-0950, FAX:03-6275-0951',
        },'contact');
        convo.addMessage({
          action: 'default'
        }, 'contact');

        // set up IOT thread
        convo.addMessage({
          text: '[iot案例紹介](https://mono-wireless.com/jp/tech/Internet_of_Things.html)',
        },'iot');
        convo.addMessage({
          action: 'default'
        }, 'iot');

        // set up ITService thread
        convo.addMessage({
          text: '[ITサービス案例紹介](http://mbpsmartec.co.jp/business/)',
        },'ITService');
        convo.addMessage({
          action: 'default'
        }, 'ITService');

      });

    });


}
