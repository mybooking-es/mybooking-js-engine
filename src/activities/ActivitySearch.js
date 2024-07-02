require(['jquery', 'i18next', 'ysdtemplate', 
        'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
        'select2','jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
        'jquery.ui.datepicker.validation','jquery.form'],
    function($, i18next, tmpl,
             commonServices, commonSettings, commonTranslations, commonLoader, select2) {

  var activitySelectorModel = {

    requestLanguage: null,
    configuration: null,

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        activitySelectorModel.configuration = data;
        activitySelectorView.init();
      });
    },  


  }

  var activitySelectorController = {

  }

  var activitySelectorView = {

  	init: function() {
				activitySelectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        // Initialize i18next for translations
        i18next.init({  
                        lng: activitySelectorModel.requestLanguage,
                        resources: commonTranslations
                     }, 
                     function (error, t) {
                        // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                        //jqueryI18next.init(i18next, $);
                        // Localize UI
                        //$('.nav').localize();
                     });
        // Setup Form
        this.setupSelectorFormTmpl();
  	},

    /**
     * Setup the selector form
     *
     * The selector form can be rendered in two ways:
     *
     * - Directly on the page (recommeded for final projects)
     * - Using a template that choose which fields should be rendered
     *
     * For the first option just create the form with the fields in the page
     * For the second option create an empty form and a template that creates
     * the fields depending on the configuration
     *
     * Note: The two options are hold for compatibility uses
     * 
     */
    setupSelectorFormTmpl: function() {

      // The selector form fields are defined in a micro-template
      if (document.getElementById('form_activities_selector_tmpl')) {
        // Load the template
        var html = tmpl('form_activities_selector_tmpl')({configuration: activitySelectorModel.configuration});
        // Assign to the form
        $('form[name=search_activities_form]').find('.search_fields_container').prepend(html);
        // Setup controls
        this.setupControls();
      }

    },

    setupControls: function() {

    	// Family selector	
    	let $selectorFamilyId = $('form[name=search_activities_form]').find('select[name=family_id]');

    	if ($selectorFamilyId.length) {
    		var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/categories';
        var urlParams = [];
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
				var familyValue = $selectorFamilyId.attr('data-value');
	      var familySelect = $selectorFamilyId.select2({	
	      													  width: '100%',
														      	theme: 'bootstrap4',
														      	ajax: {
													            url: url,
													            dataType: 'json',
													            processResults: function (data) {
													                var result = data.map(function(x) { return {id: x.id, text: x.name} });
													                // Transforms the top-level key of the response object from 'items' to 'results'
													                return {
													                  results: result
													                };
													            }
													          }
														      });
	      // Preload with the current option
        $.ajax({
            type: 'GET',
            url: url,
        }).then(function (data) {
            familySelect.find('option[value!=""]').remove();
            for (var idx=0; idx<data.length; idx++) {
              var option = new Option(data[idx].name, data[idx].id, false, false);
              familySelect.append(option);
            }
            if (typeof familyValue !== 'undefined' && familyValue != '') {
              familySelect.val(familyValue).trigger('change');
              // Trigger the select2:select event
  						familySelect.trigger({
  						        type: 'select2:select',
  						        params: {
  						            data: data
  						        }
  						});
            }

        });
    	}

    	// Destination selector
			let $selectorDestinationId = $('form[name=search_activities_form]').find('select[name=destination_id]');

    	if ($selectorDestinationId.length) {
    		var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/destinations';
        var urlParams = [];
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
				var destinationValue = $selectorDestinationId.attr('data-value');
	      var destinationSelect = $selectorDestinationId.select2({	
	      													  width: '100%',
														      	theme: 'bootstrap4',
														      	ajax: {
													            url: url,
													            dataType: 'json',
													            processResults: function (data) {
													                var result = data.map(function(x) { return {id: x.id, text: x.name} });
													                // Transforms the top-level key of the response object from 'items' to 'results'
													                return {
													                  results: result
													                };
													            }
													          }
														      });
	      // Preload with the current option
        $.ajax({
            type: 'GET',
            url: url,
        }).then(function (data) {
            destinationSelect.find('option[value!=""]').remove();
            for (var idx=0; idx<data.length; idx++) {
              var option = new Option(data[idx].name, data[idx].id, false, false);
              destinationSelect.append(option);
            }
            if (typeof destinationValue !== 'undefined' && destinationValue != '') {
              destinationSelect.val(destinationValue).trigger('change');
              // Trigger the select2:select event
  						destinationSelect.trigger({
  						        type: 'select2:select',
  						        params: {
  						            data: data
  						        }
  						});
            }

        });
    	}

    }


  }

  activitySelectorModel.loadSettings();


});