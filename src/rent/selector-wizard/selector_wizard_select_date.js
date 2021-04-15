define('selector_wizard_select_date', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings',
         'commonTranslations', 'YSDEventTarget', 'ysdtemplate', 'i18next', 'moment',
         'jquery.i18next', 'jquery.validate', 
         'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,commonServices, commonSettings, 
                  commonTranslations, YSDEventTarget, tmpl, i18next, moment) {


  selectorWizardSelectDate = {

    model: {
      events: new YSDEventTarget(),
      configuration: null,      
      requestLanguage: null,
      
      // The min and max date
      minDate: null,
      maxDate: null,

      // Current month start and end date
      startDate: null,
      endDate: null,

      // Related place
      place: null,
      days: null,

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
       * Access the API to get the available pickup days in a month
       */
      loadDays: function(year, month) { 

        this.startDate = moment([year, month - 1]);
        this.endDate = moment(this.startDate).endOf('month');
        var self = this;
        
        var from = this.startDate.format('YYYY-MM-DD');
        var to = this.endDate.format('YYYY-MM-DD');

        // Build the URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/dates';
        url += '?from='+from+'&to='+to;
        if (this.place && this.place != '') {
          url += '&place='+ commonSettings.data.encodeData(this.place);
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
        // End Point request
        $.ajax({
          type: 'GET',
          url: url,
          dataType: 'json',
          success: function(data, textStatus, jqXHR) {
            self.days = data;
            selectorWizardSelectDate.view.update('loaded_days');
          },
          error: function(data, textStatus, jqXHR) {
            alert(i18next.t('selector.error_loading_data'));
          }
        });
      }


    },

    controller: {

      dateChanged: function() {

        var date = $('#selector_date').datepicker('getDate');
        var dateStr = moment(date).format('DD/MM/YYYY');
        selectorWizardSelectDate.model.events.fireEvent({type: 'date_selected', data: dateStr});

      },

      monthChanged: function(year, month) {
        selectorWizardSelectDate.model.loadDays(year, month);  
      }

    },

    view: {


      init: function() {

        // Setup request language (for API calls)
        selectorWizardSelectDate.model.requestLanguage = commonSettings.language(document.documentElement.lang);
        
        // Load step view
        this.loadStepView();

        // Setup controls
        this.setupControls();

      },

      loadStepView: function() {

        var html = tmpl('select_date_tmpl');
        $('#wizard_container_step_body').html(html);

      },

      setupControls: function() {

        this.setupDateControl();

      },

      setupDateControl: function() {

        // Setup datepicker language
        $.datepicker.setDefaults( $.datepicker.regional[selectorWizardSelectDate.model.requestLanguage || 'es'] );
        var locale = $.datepicker.regional[selectorWizardSelectDate.model.requestLanguage || 'es'];

        // Setup First and last date
        var firstDate = selectorWizardSelectDate.model.minDate;
        var maxDate = selectorWizardSelectDate.model.maxDate;

        // Date
        $('#selector_date').datepicker({
            numberOfMonths:1,
            minDate: firstDate,
            maxDate: maxDate,
            dateFormat: 'dd/mm/yy',
            constraintInput: true,
            beforeShowDay: function(date) {
              if (selectorWizardSelectDate.model.days != null) {
                var idx = selectorWizardSelectDate.model.days.findIndex(function(element){
                            return element == moment(date).format('YYYY-MM-DD');
                          }); 
                if (idx > -1) {
                  return [true];
                }     
                else {
                  return [false];
                }              
              }
              else {
                return [false];
              }
            },
            onChangeMonthYear: function(year, month, instance) {
               selectorWizardSelectDate.controller.monthChanged(year, month);         
            },
            onSelect: function(dateText, inst) {
               selectorWizardSelectDate.controller.dateChanged();
            }
            

          }, locale);
        // Avoid Google Automatic Translation
        $('.ui-datepicker').addClass('notranslate');

        // Load the days
        var now = moment(firstDate, selectorWizardSelectDate.model.configuration.dateFormat).
                   tz(selectorWizardSelectDate.model.configuration.timezone);
        var month = now.format('MM');
        var year = now.format('YYYY');
        selectorWizardSelectDate.model.loadDays(year, month);

      },

      update: function(event) {

        switch (event) {
          case 'loaded_days':
            $('#selector_date').datepicker('refresh');
            setTimeout(function(){
                $('wizard_container_step_header').trigger('click');
            }, 500);
            break;
        }

      }


    }

  }


  return selectorWizardSelectDate;


});