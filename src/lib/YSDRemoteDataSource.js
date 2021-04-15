define(['YSDAbstractDataSource','jquery'], function(YSDAbstractDataSource, $) {

  /* --------------------------------
     RemoteDataSource
     -------------------------------- */
  YSDRemoteDataSource = function(url, matchingProperties, adapters) {

    YSDAbstractDataSource.apply(this, arguments);

    this.url  = url;
    this.matchingProperties = matchingProperties;
    this.adapters = adapters || [];
    this.data = [];
  
    this.retrieveData = function(query) { /* Retrieve data function */
    
      var self = this;
        
      $.getJSON(this.url,
                query,
                function success_handler(data) {
                  self.data = data;
                  self.events.fireEvent({type:'data_available', data: self.adaptData(self.data, self.matchingProperties, self.adapters)});
                });          
    
    }
  
  }

  YSDRemoteDataSource.prototype = new YSDAbstractDataSource();
  YSDRemoteDataSource.constructor = YSDRemoteDataSource;
 
  return YSDRemoteDataSource;
  
});