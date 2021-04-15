window.mybookingEngine = function(){
  var baseURL = '';
  var apiKey = '';
  var extrasStep = true;
  var chooseProductUrl = 'choose_product.html';
  var chooseExtrasUrl = 'choose_extras.html';
  var completeUrl = 'complete.html';
  var summaryUrl = 'summary.html';
  var useGoogleMaps = false;
  var customLoader = true;
  var googleMapsSettings = {
  };
  function getBaseURL() {
    return baseURL;
  }
  function getApiKey() {
    return apiKey;
  }
  function getExtrasStep() {
    return extrasStep;
  }
  function getChooseProductUrl() {
    return chooseProductUrl;
  }
  function getChooseExtrasUrl() {
    return chooseExtrasUrl;
  }
  function getCompleteUrl() {
    return completeUrl;
  }
  function getSummaryUrl() {
    return summaryUrl;
  }
  function getCustomLoader() {
    return customLoader;
  }  
  function getUseGoogleMaps() {
    return useGoogleMaps;
  }
  function getGoogleMapsSettings() {
    return googleMapsSettings;
  }
  return{
    baseURL: getBaseURL,
    apiKey: getApiKey,
    useGoogleMaps: getUseGoogleMaps,
    googleMapsSettings: getGoogleMapsSettings,
    extrasStep: getExtrasStep,
    chooseProductUrl: getChooseProductUrl,
    chooseExtrasUrl: getChooseExtrasUrl,
    completeUrl: getCompleteUrl,
    summaryUrl: getSummaryUrl
  }
}();