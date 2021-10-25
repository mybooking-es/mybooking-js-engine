const engineInit = async function (){
  var config = await fetch('../env.json').then(response => response.json());
  var shoppingCartUrl = 'shopping-cart.html';
  var orderUrl = 'summary.html';
  function getBaseURL() {
    return config.baseURL;
  }
  function getApiKey() {
    return config.apiKey;
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
};

export default engineInit;