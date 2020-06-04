
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
  static getfulfillmentText(message){
    if(message && message.queryResult && message.queryResult.fulfillmentText){
      return message.queryResult.fulfillmentText;
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
    let parameters = UtilsService.getParameters(message);
    if(parameters[paramName]){
      return parameters[paramName]; 
    }
    let midParam = parameters[paramName];  
    if(typeof(midParam) ==="string"){
      return midParam;
    }

    if(parameters.fields && parameters.fields[paramName]){
      midParam = parameters.fields[paramName];
    }
    if(typeof(midParam) === "string"){
      return midParam;
    }

    if(midParam.listValue 
      && midParam.listValue.values)
    {
      midParam = midParam.listValue.values;
    }

    if(midParam && midParam[0].stringValue){
      return midParam[0].stringValue;
    }
    return null;
  }
}