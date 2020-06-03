module.exports = function(controller) {

  controller.hears('quick replies','message_received', function(bot, message) {

    bot.reply(message, {
        text: 'Look, quick replies!',
        quick_replies: [
            {
                title: 'Hello',
                payload: 'hello'
            },
            {
                title: 'Test',
                payload: 'test'
            },
        ]
      },function() {});
  });

  controller.hears(['pizza','ピザ'], 'order', function(bot, message) {
    console.debug(`intent:${message.intent}`);
    
    bot.reply(message, {
      text: 'ほれんそ、人参味のピザが選べます。',
      quick_replies: [
          {
              title: 'ほうれん草',
              payload: 'hourenso'
          },
          {
              title: '人参味',
              payload: 'ninjin'
          },
      ]
    },function() {});
  });
  
}