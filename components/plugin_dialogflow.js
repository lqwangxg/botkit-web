// You can find your project ID in your Dialogflow agent settings

require("dotenv").config();
const utils = require("../service/utils");
const dialogflow = require('dialogflow');
const debug = require('debug')('botkit:dialogflow');
const uuid = require("uuid");

const intent = require("../service/intent");

module.exports = function(controller) {
 
  controller.middleware.receive.use(function(bot, message, next) {
    
      intent.detectTextIntent(projectId, sessionId, [message.text], languageCode);
      
  });

}
