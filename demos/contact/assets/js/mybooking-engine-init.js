window.mybookingEngine = function(){
  var baseURL = '';
  var apiKey = '';  
  function getBaseURL() {
    return baseURL;
  }
  function getApiKey() {
    return apiKey;
  }  
  return{
    baseURL: getBaseURL,
    apiKey: getApiKey,    
  }
}();