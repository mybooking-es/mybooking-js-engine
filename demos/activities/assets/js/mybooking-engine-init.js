window.mybookingEngine = function(){
  var baseURL = '';
  var apiKey = '';    
  var shoppingCartUrl = 'shopping-cart.html';
  var orderUrl = 'summary.html';
  function getBaseURL() {
    return baseURL;
  }
  function getApiKey() {
    return apiKey;
  }  
  function getShoppingCartUrl() {
    return shoppingCartUrl;
  }
  function getOrderUrl() {
    return orderUrl;
  }
  return{
    baseURL: getBaseURL,
    apiKey: getApiKey,    
    shoppingCartUrl: getShoppingCartUrl,
    orderUrl: getOrderUrl
  }
}();