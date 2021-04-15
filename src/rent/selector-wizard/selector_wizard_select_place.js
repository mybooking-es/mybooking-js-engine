define('selector_wizard_select_place', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings',
         'commonTranslations', 'YSDEventTarget',
         'i18next', 'moment', 'ysdtemplate',
         'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,commonServices, commonSettings, 
                  commonTranslations, YSDEventTarget, i18next, moment, tmpl) {


  selectorWizardSelectPlace = {

    model: {

 	    events: new YSDEventTarget(),
      configuration: null,
      requestLanguage: null,

      mode: 'pickup', // Mode pickup/return
      pickup_place: null, // If return mode it holds the pickup_place

      // Available places to select
      places: null,
      // Selected place
      place: null,
      placeDescription: null,

	    addListener: function(type, listener) { /* addListener */
	      this.events.addEventListener(type, listener);  
	    },
	    
	    removeListener: function(type, listener) { /* removeListener */
	      this.events.removeEventListener(type, listener);     
	    },

	    removeListeners: function(type) { /* remove listeners*/
	     this.events.removeEventListeners(type);
	    },

    	loadPlaces: function() {
      	var self = this;
        // Build URL
        var url = commonServices.URL_PREFIX;
        if (this.mode === 'return') {
      	  url += '/api/booking/frontend/return-places';
        }
        else {
          url += '/api/booking/frontend/pickup-places';
        }
        var urlParams = [];
        if (this.mode == 'return' && this.pickup_place) {
          urlParams.push('pickup_place='+encodeURIComponent(this.pickup_place));
        } 
        if (this.configuration.multipleDestinations) {
          urlParams.push('format=destinations-grouped');
        }
        if (this.requestLanguage != null) {
          urlParams.push('lang=' + this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }           
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
        // Request
	      $.ajax({
	        type: 'GET',
	        url: url,
	        dataType: 'json',
	        success: function(data, textStatus, jqXHR) {
	          self.places = data;
	          selectorWizardSelectPlace.view.update('loaded_places');
	        },
	        error: function(data, textStatus, jqXHR) {
	          alert(i18next.t('selector.error_loading_data'));
	        }
	      });

    	},

    },

    controller: {

      destinationSelectorClick: function(value) {
         console.log('select destination');
         if (value == 'all') {
           $('.destination-group').show();
         }
         else {
           $('.destination-group').hide();
           $('.destination-group[data-destination-id='+value+']').show();
         }
      },

    	placeSelected: function(value, description) {
        console.log('select place');
				selectorWizardSelectPlace.model.place = value;
        selectorWizardSelectPlace.model.placeDescription = description;
				selectorWizardSelectPlace.model.events.fireEvent({type: 'place_selected', data: {value: value, description: description}});
    	}

    },

    view: {

    	init: function() {

        // Setup request language (for API calls)
        selectorWizardSelectPlace.model.requestLanguage = commonSettings.language(document.documentElement.lang);
        selectorWizardSelectPlace.model.loadPlaces();

    	},

    	update: function(event) {
    		switch (event) {
    				case 'loaded_places':
    				  this.showPlaces();
    				  break;
    		}
    	},

    	showPlaces: function() {

    		var html;

        if (selectorWizardSelectPlace.model.places['destinations']) {
          html = tmpl('select_place_multiple_destinations_tmpl')({places: selectorWizardSelectPlace.model.places});
        }
        else {
          html = tmpl('select_place_tmpl')({places: selectorWizardSelectPlace.model.places});
        }

    		$('#wizard_container_step_body').html(html);
        
        if (selectorWizardSelectPlace.model.places['destinations']) {
          this.setupDestinationEvents();
        }

    		$('.selector_place').bind('click', function(e) {
    			 //var value = $(this).html();
           var value=$(this).attr('data-place-id');
           var description=$(this).attr('data-place-name');
    			 selectorWizardSelectPlace.controller.placeSelected(value, description);
    		});

    	},

      setupDestinationEvents: function() {
        $('.destination-selector').bind('click', function(){
          selectorWizardSelectPlace.controller.destinationSelectorClick($(this).attr('data-destination-id'));
        });
      }

    }

  }


  return selectorWizardSelectPlace;


});