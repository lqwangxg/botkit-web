module.exports = function(controller) {

  // CHANGE MESSAGE
  controller.middleware.receive.use(function(bot, message, next) {
    if(message.user.match(/admin/i)){      
      if(message.type === "message_received"){
        message.type = "MMC_MSG";
      }
    }else{
      if(message.type === "message_received"){
        message.type = "USR_MSG";
      }
    }

    next();
  });

}
