define(['YSDAbstractDataSource'], function(YSDAbstractDataSource) {

  /* --------------------------------
     MemoryDataSource
     --------------------------------
     A datasource which holds the data in the memory
  */
  
  YSDMemoryDataSource = function(_data, matchingProperties, adapters) {
	
    YSDAbstractDataSource.apply(this, arguments);
   
    if (_data instanceof Array) {
  
      this.data = [];
    
      for (index in _data) {
        if (_data[index] instanceof Object) {
          this.data.push(_data[index]);	
        }	
        else
        {
          this.data.push({'id':_data[index], 'description':_data[index]});	
        }
      }       
    } 
    else { 
      this.data = _data;
    }
  
    this.matchingProperties = matchingProperties;
    this.adapters = adapters || [];
  
    var self = this;
      
    this.retrieveData = function(query) { /* Retrieve Data function */
      this.events.fireEvent({type:'data_available', data: self.adaptData(self.data, self.matchingProperties, self.adapters)});
    }
  	
  }

  YSDMemoryDataSource.prototype = new YSDAbstractDataSource();
  YSDMemoryDataSource.constructor = YSDMemoryDataSource;

  return YSDMemoryDataSource;

});