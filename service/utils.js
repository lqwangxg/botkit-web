
module.exports = class UtilsService {

  static getAction(message){
    if(message && message.queryResult && message.queryResult.action){
      return message.queryResult.action;
    }

    if(message && message.text){
      const match = message.text.match(/movie\s+(.+)/);
      if(match){
        return { title: match[1], name:"get-movie-info" };
      }
    }
    return "";
  }
  static getParameters(message){
    if(message && message.queryResult && message.queryResult.parameters){
      return message.queryResult.parameters;
    }
    if(message && message.text){
      const match = message.text.match(/movie\s+(.+)/);
      if(match){
        return {movie: match[1]};
      }
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