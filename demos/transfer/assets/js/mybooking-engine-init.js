const engineInit = async function (){
  var config = await fetch('../env.json').then(response => response.json());
  var transferExtrasStep = false;
  var transferChooseProductUrl = 'choose_product.html';
  var transferChooseExtrasUrl = 'choose_extras.html';
  var transferCompleteUrl = 'complete.html';
  var transferSummaryUrl = 'summary.html';
  var customLoader = false;
  function getBaseURL() {
    return config.baseURL;
  }
  function getApiKey() {
    return config.apiKey;
  }
  function getTransferExtrasStep() {
    return transferExtrasStep;
  }
  function getTransferChooseProductUrl() {
    return transferChooseProductUrl;
  }
  function getTransferChooseExtrasUrl() {
    return transferChooseExtrasUrl;
  }
  function getTransferCompleteUrl() {
    return transferCompleteUrl;
  }
  function getTransferSummaryUrl() {
    return transferSummaryUrl;
  }
  function getCustomLoader() {
    return customLoader;
  }  
  function getUseGoogleMaps() {
    return useGoogleMaps;
  }

  return{
    baseURL: getBaseURL,
    apiKey: getApiKey,
    transferExtrasStep: getTransferExtrasStep,
    transferChooseProductUrl: getTransferChooseProductUrl,
    transferChooseExtrasUrl: getTransferChooseExtrasUrl,
    transferCompleteUrl: getTransferCompleteUrl,
    transferSummaryUrl: getTransferSummaryUrl
  }
};

export default engineInit;