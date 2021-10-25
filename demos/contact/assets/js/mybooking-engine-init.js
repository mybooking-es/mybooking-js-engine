const engineInit = async function (){
  var config = await fetch('../env.json').then(response => response.json());
  function getBaseURL() {
    return config.baseURL;
  }
  function getApiKey() {
    return config.apiKey;
  }  
  return{
    baseURL: getBaseURL,
    apiKey: getApiKey,    
  }
};

export default engineInit;