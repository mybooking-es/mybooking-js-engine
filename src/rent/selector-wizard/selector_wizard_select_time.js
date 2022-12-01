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


  var selectorWizardSelectTime = {

    model: {

 	    events: new YSDEventTarget(), // Events 
      configuration: null,   // Engine configuration
      requestLanguage: null, // Request language

      // Times
      times: null, // Possible times (retrieved from Api)
      time: null,  // Selected time

      // Related place and date

      place: null,   // Selected place
      date: null,    // Selected date
      minTime: null, // Min time

      // Action
      action: null, // deliveries / collections / any

	    addListener: function(type, listener) { /* addListener */
	      this.events.addEventListener(type, listener);  
	    },
	    
	    removeListener: function(type, listener) { /* removeListener */
	      this.events.removeEventListener(type, listener);     
	    },

	    removeListeners: function(type) { /* remove listeners*/
	     this.events.removeEventListeners(type);
	    },

      /**
       * Access the API to get the available pickup hours in a date
       */
      loadTimes: function() { 

        var self=this;
        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+this.date;
        if (this.place && this.place != '') {
          url += '&place='+commonSettings.data.encodeData(this.place);
        }          
        if (this.action && this.action != '') {
          url += '&action='+this.action;
        }        
        if (this.requestLanguage != null) {
          url+='&lang='+this.requestLanguage;
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          url += '&api_key='+commonServices.apiKey;
        }   
        // Request
        $.ajax({
          type: 'GET',
          url: url,
          dataType: 'json',
          success: function(data, textStatus, jqXHR) {
            self.times = data;
            selectorWizardSelectTime.view.update('loaded_times');
          },
          error: function(data, textStatus, jqXHR) {
            alert(i18next.t('selector.error_loading_data'));
          }
        });

      }

    },

    controller: {

    	timeSelected: function(value) {
				selectorWizardSelectTime.model.time = value;
				selectorWizardSelectTime.model.events.fireEvent({type: 'time_selected', data: value});
    	}

    },

    view: {

    	init: function() {

        // Setup request language (for API calls)
        selectorWizardSelectTime.model.requestLanguage = commonSettings.language(document.documentElement.lang);
        selectorWizardSelectTime.model.loadTimes();

    	},

    	update: function(event) {
    		switch (event) {
    				case 'loaded_times':
    				  this.showTimes();
    				  break;
    		}
    	},

    	showTimes: function() {

        // Filter min time
        if (selectorWizardSelectTime.model.minTime) {
          var times = selectorWizardSelectTime.model.times.filter( time => time > selectorWizardSelectTime.model.minTime)
        }
        else {
          var times = selectorWizardSelectTime.model.times;
        }

        // Load the times
    		var html = tmpl('select_time_tmpl')({times: times});
    		$('#wizard_container_step_body').html(html);

    		$('.selector_time').bind('click', function(e) {
    			 var value = $(this).html();
    			 selectorWizardSelectTime.controller.timeSelected(value);
    		});

    	}

    }

  }


  return selectorWizardSelectTime;


});