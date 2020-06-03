
module.exports = class UtilsService {

  static getAction(message){
    if(message && message.queryResult && message.queryResult.action){
      return message.queryResult.action;
    }
    return "";
  }
  static getParameters(message){
    if(message && message.queryResult && message.queryResult.parameters){
      return message.queryResult.parameters;
    }
    return [];
  }
  static getParameterValue(message, paramName){
    let parameters = getParameters(message);
    if(parameters[paramName]){
      return parameters[paramName]; 
    }
    return null;
  }
}