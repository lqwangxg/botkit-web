module.exports = function(controller) {

  // CHANGE MESSAGE
  controller.middleware.send.use(function(bot, message, next) {
    // ユーザ情報存在しない場合、処理飛ばす
    if (!message.user) {
      next();
      return;
    }
    console.log('message sending.', message);
    
    next();
  });

  // CHANGE MESSAGE
  controller.middleware.receive.use(function(bot, message, next) {
    // ユーザ情報存在しない場合、処理飛ばす
    if (!message.user) {
      next();
      return;
    }
    
    if(message.user.match(/admin/i)){
      console.log('from admin MMC:',message);
      if(message.type === "message_received"){
        message.type = "MMC_MSG";
      }
    }else{
      console.log('from user message:',message);
      if(message.type === "message_received"){
        message.type = "USR_MSG";
      }
    }

    next();
  });
}
