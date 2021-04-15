define('commonLoader',['commonServices','loaderSpinner'],function(commonServices, LoaderSpinner){

  var loader = {

  	loaderSpinner: null,
    showing: false,

  	show: function() {

      console.log('show loader');

      if (this.showing) {
        return;
      }

  		if (commonServices.customLoader) {
				$('#full_loader').show();
  		}
  		else {
  			this.getLoader().show();
  		}

      this.showing = true;

  	},

  	hide: function() {

      console.log('hide loader');

  		if (commonServices.customLoader) {
        $('#full_loader').hide();
      }
      else {
				this.getLoader().hide();
      }

      this.showing = false;

  	},

  	getLoader: function() {

  		if (this.loaderSpinner == null) {
  			this.loaderSpinner = new LoaderSpinner();
  		}

  		return this.loaderSpinner;

  	}

  }

  return loader;

});