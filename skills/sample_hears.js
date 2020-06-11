module.exports = function(controller) {


  controller.hears('test','message_received', function(bot, message) {

    bot.reply(message,'I heard a test');

  });

  controller.hears('typing','message_received', function(bot, message) {

    bot.reply(message,{
      text: 'This message used the automatic typing delay',
      typing: true,
      typingDelay:1000,
    },  ()=> {
      //callback after first reply()
      bot.reply(message,{
        text: 'This message specified a 5000ms typing delay',
        typingDelay: 5000,
      });
    });

  });

}
