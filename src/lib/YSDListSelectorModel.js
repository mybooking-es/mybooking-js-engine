define(function(){

  var YSDListSelectorModel = function(dataSource, value) {

	this.dataSource = dataSource;
	this.data = [];
	this.value = value;

	this.setView = function(view) {
	  this.view = view;
	}

	var self = this;

	this.eventListener = function(event) {
        switch (event.type) {
            case 'data_available' :
                self.data = event.data;
                self.view.notify('data_changed');
                break;
        }
    };

  this.dataSource.addListener('data_available', this.eventListener);

	this.retrieveData = function() {
	  this.dataSource.retrieveData();
	}

	this.setValue = function(value) {
	  this.value = value;
	  this.view.notify('value_changed');
	}

	this.removeEventListener = function() {
		this.dataSource.removeListener('data_available', this.eventListener);
	}

  }

  return YSDListSelectorModel;

});