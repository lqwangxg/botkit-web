
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

  
  static helpDesk(convo, headText){
    let typingDelay = 0;
    if(!headText){
      headText="他に";
      typingDelay = 5000;
    }
    convo.say({
      text: `${headText}お問い合わせ内容をどうぞ`,
      typingDelay: typingDelay,
      quick_replies: [
        {
          title: 'iot関連',
          payload: 'iot関連',
        },
        {
          title: 'bigdata関連',
          payload: 'bigdata関連',
        },
        {
          title: '会社案内',
          payload: '会社案内',
        },{
          title: '事業内容',
          payload: '事業内容',
        },{
          title: '最新ニュース',
          payload: '最新ニュース',
        },{
          title: 'ログイン',
          payload: 'ログイン',
        }
      ]
    });
  }
}