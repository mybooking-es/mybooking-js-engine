const engineInit = async function (){
  var config = await fetch('../env.json').then(response => response.json());
  var extrasStep = false;
  var chooseProductUrl = 'choose_product.html';
  var chooseExtrasUrl = 'choose_extras.html';
  var completeUrl = 'complete.html';
  var summaryUrl = 'summary.html';
  var useGoogleMaps = false;
  var customLoader = false;
  var googleMapsSettings = {
  };
  function getBaseURL() {
    return config.baseURL;
  }
  function getApiKey() {
    return config.apiKey;
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
};

export default engineInit;