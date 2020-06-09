// You can find your project ID in your Dialogflow agent settings

require("dotenv").config();
const utils = require("../service/utils");
const intent = require("../service/intent");

module.exports = function(controller) {
 
  controller.middleware.send.use(function(bot, message, next) {
    if(message.platform){
      console.log("platform:" + message.platform, message.text);
    }
    next();
  });

}
