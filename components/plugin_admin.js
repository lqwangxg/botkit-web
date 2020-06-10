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

  //受信メッセージをセンターへ転送
  controller.middleware.receive.use(function(bot, message, next) {
    //受信フラグ
    message.isReceive = true;
    controller.transferMessageToCenter(bot, message);
    next();
  });

  //送信メッセージをセンターへ転送
  controller.middleware.send.use(function(bot, message, next) {
    //受信フラグ
    message.isSend = true;
    controller.transferMessageToCenter(bot, message);
    next();
  });

  controller.transferMessageToCenter = function(bot, message, callback){
    message.isAdminMessage = message.user.match(/admin/i);
    //adminMessageは自身へ転送不要
    if(message.isAdminMessage){
      message.transferResult = "NA";
      //後始末処理があるかもしれません
      if(callback){
        callback(bot, message);
      }
      return;
    }
    
    //センターへ送信
    controller.transferMessage (message, "admin"); 
  }

  controller.transferMessage = function(message, dest){
    //転送内容がなければ、転送しない
    if(!message.text) return;
    //転送メッセージの無限ループ転送防止
    if(message.isTransferMessage)return;
    //目的地未設定防止
    if(!dest) return;

    if(typeof(dest) == "string"){
      dest = [dest];
    }

    //受信者存在しなければ、ディフォルト:admin
    for (var e = 0; e < dest.length; e++) {
      //宛先を取得
      const destBot = controller.botClients.find(element => dest[e] === element.user);
      if(destBot){
        let messageToC = {};
        Object.assign(messageToC, message);
        //メッセージタイプ設定、Client側のon(eventType, callback)処理の為
        messageToC.type = "message";
        messageToC.dest = dest[e];
        messageToC.isTransferMessage = true;

        if(messageToC.isSend){
          messageToC.from = "ChatBot";
        }
        if(messageToC.isReceive){
          messageToC.to = "ChatBot";
        }
        
        destBot.say(messageToC, (err, msg)=>{
          if(err){
            console.error(err);
          }
          console.log(`====transfer from:${messageToC.user}, to:${messageToC.to}, dest:${dest}, text:${messageToC.text}`);
        });
      }
    }
    
  }
}
