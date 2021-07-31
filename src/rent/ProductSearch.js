require(['jquery', 'i18next', 'ysdtemplate', 
        'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
        'select2','jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
        'jquery.ui.datepicker.validation','jquery.form'],
    function($, i18next, tmpl,
             commonServices, commonSettings, commonTranslations, commonLoader, select2) {

  productSearchModel = {

    requestLanguage: null,
    configuration: null,
    keyCharacteristics: null,

    // -------------- Load settings ----------------------------

    /**
     *  Load settings
     */ 
    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        productSearchModel.configuration = data;
        productSearchView.init();
      });
    },  

    /**
     *  Load key characteristics
     */ 
    loadKeyCharacteristics: function() {

        // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/products-key-characteristics';
       var urlParams = [];
       if (productSearchModel.requestLanguage != null) {
        urlParams.push('lang='+productSearchModel.requestLanguage);
       }
       if (commonServices.apiKey && commonServices.apiKey != '') {
         urlParams.push('api_key='+commonServices.apiKey);
       }        
       if (urlParams.length > 0) {
         url += '?';
         url += urlParams.join('&');
       }
       // Action to the URL
       $.ajax({
               type: 'GET',
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 productSearchModel.keyCharacteristics = data;
                 // Setup Form
                 productSearchView.setupSelectorFormTmpl();
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide();
                 alert(i18next.t('common.error'));
               }
          });

    }


  }

  productSearchController = {

  }

  productSearchView = {

  	init: function() {
				productSearchModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        // Initialize i18next for translations
        i18next.init({  
                        lng: productSearchModel.requestLanguage,
                        resources: commonTranslations
                     }, 
                     function (error, t) {
                        // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                        //jqueryI18next.init(i18next, $);
                        // Localize UI
                        //$('.nav').localize();
                     });
        productSearchModel.loadKeyCharacteristics();
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
      if (document.getElementById('form_products_selector_tmpl')) {
        // Load the template
        var html = tmpl('form_products_selector_tmpl')({configuration: productSearchModel.configuration,
                                                        keyCharacteristics: productSearchModel.keyCharacteristics});
        // Assign to the form
        $('form[name=search_products_form]').find('.search_fields_container').prepend(html);
        $('.mybooking-key-characteristic').each(function(index){
          $(this).val($(this).attr('data-value'));
        });
        $('.mybooking-price-range').each(function(index) {
          $(this).val($(this).attr('data-value'));
        });
        // Setup controls
        this.setupControls();
      }

    },

    setupControls: function() {

      this.configureFamilies();

    },

    configureFamilies: function() {

      // Family selector  
      $selectorFamilyId = $('form[name=search_activities_form]').find('select[name=family_id]');

      if ($selectorFamilyId.length) {
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/families';
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

    }



  }

  productSearchModel.loadSettings();


});