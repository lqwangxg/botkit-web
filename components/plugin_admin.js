module.exports = function(controller) {
  
  // CHANGE MESSAGE
  controller.middleware.receive.use(function(bot, message, next) {
    
    next();
  });

  //受信メッセージをセンターへ転送
  controller.middleware.receive.use(function(bot, message, next) {
    //受信フラグ
    message.isReceive = true;
    if(message.askHuman && message.user.match(/admin/i)){
      //人工応答が帰った場合、ユーザへ直送
      if(message.text.match(/(bye|quit|exit)/i)){
        //人工応答から自動へ
        message.askHuman = false;
        message.answerUser = false;
      }
      controller.transferMessage(message, message.callbackUser);
      return;
    }else if(message.answerUser && !message.user.match(/admin/i)){
      if(message.text.match(/(bye|quit|exit)/i)){
        //人工応答から自動へ
        message.askHuman = false;
        message.answerUser = false;
      }
      //ユーザから連続質問の場合、人工応答へ直送
      controller.transferMessage(message, "admin");
      return;
    }else{
      controller.transferMessageToCenter(bot, message);
    }
    
    next();
  });

  //送信メッセージをセンターへ転送
  controller.middleware.send.use(function(bot, message, next) {
    message.isSend = true;
    //受信フラグ
    if(!message.transferSkip){
      controller.transferMessageToCenter(bot, message);
    }

    next();
  });

  controller.transferMessageToCenter = function(bot, message, callback){
    if(message.askHuman){
      //人工応答へ切替は最優先
    }else{
      //adminMessageは自身へ転送不要
      message.transferSkip = message.user.match(/admin/i);
      if(message.transferSkip){
        return;
      }
    }
    
    //センターへ送信
    controller.transferMessage (message, "admin", callback); 
  }

  controller.transferMessage = function(message, dest, callback){
    //転送内容がなければ、転送しない
    if(!message.text) return;
    //転送不要の場合、転送しない
    if(message.transferSkip)return;
    //目的地未設定防止
    if(!dest) return;

    if(typeof(dest) == "string"){
      dest = [dest];
    }

    //受信者存在しなければ、ディフォルト:admin
    for (var e = 0; e < dest.length; e++) {
      //宛先を取得
      const destBot = controller.botClients.find(element => dest[e] === element.user);
      //送信先が見つからない場合、飛ばす
      if(!destBot)continue;
      
      let messageToC = {};
      Object.assign(messageToC, message);
      //メッセージタイプ設定、Client側のon(eventType, callback)処理の為
      messageToC.type = "message";
      messageToC.dest = dest[e];
      messageToC.transferSkip = true; //重複送信防止
      
      if(message.askHuman){
        //人工応答を希望する場合、
        messageToC.from = "ChatBot";
        transferSay(destBot, messageToC, callback);
      }else if(message.answerUser){
        //人工応答から回答する場合、
        messageToC.from = "ChatBot";
        transferSay(destBot, messageToC, callback);
      }else if(message.isSend){
        //送信メッセージをセンターお知らせ
        messageToC.from = "ChatBot";
        transferSay(destBot, messageToC, callback);
      }else if(message.isReceive){
        //受信メッセージをセンターお知らせ
        messageToC.to = "ChatBot";
        transferSay(destBot, messageToC, callback);
      }
    
    }

    function transferSay(bot, message, callback){
      bot.say(message, (err, msg)=>{
        if(err){
          console.error(err);
        }
        //後始末処理があるかもしれません
        if(callback){
          callback(bot, message);
        }

        //後片付け
        message.askHuman = false;
        message.answerUser = false;
        
        console.log(`====transfer from:${message.user}, to:${message.to}, dest:${dest}, text:${message.text}`);
      });
    }

    function transferAsk(bot, message, callback){
      bot.startConversation(message, function(err, convo) {
        // set up member threads
        convo.ask({ text: message.text }, [
          {
            pattern : '.*',
            callback: function(res, convo) {
              console.log("============transferAsk in addQuestion===========res===", res);
              //callBackTransfer(res, convo);
              convo.gotoThread('callBackTransfer');
              convo.next();
            }
          },
          {
            default: true,
            callback: function(res, convo) {
              convo.next();
            }
          }
        ]);

        convo.addQuestion({
          text:`回答内容:[${message.text}]、\nそのままユーザ様へ転送しても宜しいでしょうか？`,
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
        },[{
            pattern: 'はい',
            callback: function(res, convo){
              convo.gotoThread('callBackTransferYes');
              console.log("==========callback====callBackTransferYes=========", res);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(res, convo) {
              convo.next(); 
            }
          }
        ], {}, "callBackTransfer");

        convo.addQuestion({
          text:`回答内容:[${message.text}]、\nそのままユーザ様へ転送しても宜しいでしょうか？`,
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
        },[{
            pattern: 'はい',
            callback: function(res, convo){
              console.log("==========callback====callBackTransferYes=========", res);
              callBackTransferYes(res,convo);
              convo.next();
            }
          },
          {
            default: true,
            callback: function(res, convo) {convo.next(); }
          }
        ], {}, "callBackTransferYes");

      });

      function callBackTransferYes(message, convo){
        convo.say({text:"ユーザに転送します。", transferSkip: true});
        
        let msg ={};
        Object.assign(msg, message);
        msg.transferFromHuman = true;
        console.log("====================callBackTransferYes=========", message);
        
        convo.next();
      }
    }
  }
}
