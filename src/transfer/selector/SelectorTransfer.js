define('SelectorTransfer', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings', 'commonTranslations', 'commonLoader',
         'i18next', 'moment','ysdtemplate', 'cookie', 'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,
                  commonServices, commonSettings, commonTranslations, commonLoader, 
                  i18next, moment, tmpl, cookie) {

  /***************************************************************************
   *
   * Selector Transfer Model
   *
   ***************************************************************************/
  var SelectorTransferModel = function() {

    this.selectorView = null;

    // == Selectors

    // Search form
    this.form_selector = 'form[name=mybooking_transfer_search_form]'; 
    // Search form template
    this.form_selector_tmpl = 'transfer_form_selector_tmpl';

    // Date
    this.date_id = 'date';
    this.date_selector = '#date';

    // Time
    this.time_id = 'time';
    this.time_selector = '#time';

    // Origin point
    this.origin_point_id = 'origin_point';
    this.origin_point_selector = '#origin_point';
    
    // Destination point
    this.destination_point_id = 'destination_point';   
    this.destination_point_selector = '#destination_point';

    // One / Two ways trip
    this.round_trip_id = 'round_trip';
    this.round_trip_selector = 'input[name=round_trip]';
    this.return_block_id = 'return_block';
    this.return_block_selector = '#return_block';

    // Return Date
    this.return_date_id = 'return_date';
    this.return_date_selector = '#return_date';

    // Return Time
    this.return_time_id = 'return_time';
    this.return_time_selector = '#return_time';

    // Return Origin point
    this.return_origin_point_id = 'return_origin_point';
    this.return_origin_point_selector = '#return_origin_point';
    
    // Return Destination point
    this.return_destination_point_id = 'return_destination_point';   
    this.return_destination_point_selector = '#return_destination_point';

    // Number of people
    this.number_of_adults_id = 'number_of_adults';
    this.number_of_adults_selector = '#number_of_adults';
    this.number_of_children_id = 'number_of_children';
    this.number_of_children_selector = '#number_of_children';
    this.number_of_infants_id = 'number_of_infants';
    this.number_of_infants_selector = '#number_of_infants';

    // == State variables
    this.dates = null;
    this.times = null;
    this.returnDates = null;
    this.returnTimes = null;


    this.dataSourceOriginPoints = null; // Origin points datasource
    this.dataSourceDestinationPoints = null; // Destination points datasource
    this.dataSourceReturnDestinationPoints = null; // Return Destination points datasource
    this.requestLanguage = null;
    this.configuration = null;
    this.shopping_cart = null;
    this.loadedShoppingCart = false;

    this.setSelectorView = function(_selectorView) {
        this.selectorView = _selectorView;
    }

    /**
     * Load Origin Days
     */
    this.loadDays = function(year, month) { /* Load pickup days */
      console.log('loadDays. year='+year+' month='+month);
      this.startDate = moment([year, month - 1]);
      this.endDate = moment(this.startDate).endOf('month');
      var self = this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/dates?from='+
                this.startDate.format('YYYY-MM-DD')+
                '&to='+this.endDate.format('YYYY-MM-DD');
      url += '&transfer_destination_point_id='+$(this.origin_point_selector).val();
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }        
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.dates = data;
          self.selectorView.update('days', 'date');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Load Return Days
     */
    this.loadReturnDays = function(year, month) { 
      console.log('loadReturnDays. year='+year+' month='+month);
      this.startDate = moment([year, month - 1]);
      this.endDate = moment(this.startDate).endOf('month');
      var self = this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/dates?from='+
                this.startDate.format('YYYY-MM-DD')+
                '&to='+this.endDate.format('YYYY-MM-DD');
      url += '&transfer_destination_point_id='+$(this.return_origin_point_selector).val();
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }        
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.returnDates = data;
          self.selectorView.update('days', 'return_date');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Load Hours
     */
    this.loadHours = function(date) { 
      var self=this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date;
      url += '&transfer_destination_point_id='+$(this.return_origin_point_selector).val();      
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
          self.selectorView.update('hours', 'time', data);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Load Hours
     */
    this.loadReturnHours = function(date) { 
      var self=this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date;
      url += '&transfer_destination_point_id='+$(this.return_origin_point_selector).val();      
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }        
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.returnTimes = data;
          self.selectorView.update('hours', 'return_time', data);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

  };

  /***************************************************************************
   *
   * Selector Transfer Controller
   *
   ***************************************************************************/
  var SelectorTransferController = function() {

    this.selectorView = null;
    this.selectorModel = null;

    /**
     * Set the selector view
     */
    this.setSelectorView = function( _selectorView ) {
        this.selectorView = _selectorView;
    }
  
    /**
    * Set the selector model
    */
    this.setSelectorModel = function( _selectorModel ) {
        this.selectorModel = _selectorModel;
    }

    /**
     * Date Changed
     */ 
    this.dateChanged = function (element) {
      var self = this;
      if ( $(this.selectorModel.return_date_selector).length > 0 ) {
        $(this.selectorModel.return_date_selector).datepicker('option', 'minDate', 
              $(document.getElementById(element.id)).datepicker('getDate'));
      }
      // Load Hours
      var date = moment(element.lastVal, this.selectorModel.configuration.dateFormat).format('YYYY-MM-DD');
      this.selectorModel.loadHours(date);
      //this.selectorView.loadTime();
    }

    /**
     * Return Date Changed
     */
    this.returnDateChanged = function (element) {
      var self = this;
      // Load Hours
      var date = moment(element.lastVal, this.selectorModel.configuration.dateFormat).format('YYYY-MM-DD');
      this.selectorModel.loadReturnHours(date);
      //this.selectorView.loadReturnTime();
    }          

    /**
     * Round trip Changed
     */ 
    this.rountTripChanged = function(event) {
        var value = event.currentTarget.value;
        if (value === 'true') {
          $(this.selectorModel.return_block_selector).show();
          // Setup the return date min value as the date 
          if ($(this.selectorModel.date_selector).datepicker('getDate')) {
            $(this.selectorModel.return_date_selector).datepicker('option', 'minDate', 
                $(this.selectorModel.date_selector).datepicker('getDate'));
          }
        } else {
          $(this.selectorModel.return_block_selector).hide();
        }      
    }

  };


  /***************************************************************************
   *
   * Selector Transfer View
   *
   ***************************************************************************/
  var SelectorTransferView = function(_selectorModel, _selectorController) {

    this.selectorModel = _selectorModel;
    this.selectorController = _selectorController;

    /**
     * Init
     */
    this.init = function() {
        var self = this;

        // Setup request language and settings
        this.selectorModel.requestLanguage = commonSettings.language(document.documentElement.lang);

        // Setup controls
        this.setupSelectorFormTmpl();
        
        // Setup origin and destination points
        this.loadOriginPoints('origin_point');
        if (this.selectorModel.shopping_cart) {
          this.loadDestinationPoints('destination_point', false, this.selectorModel.shopping_cart.origin_point_id);
        }
        this.loadOriginPoints('return_origin_point');
        if (this.selectorModel.shopping_cart) {
          this.loadDestinationPoints('return_destination_point', false, this.selectorModel.shopping_cart.return_origin_point_id);
        }

        if (this.selectorModel.shopping_cart) {
          // Setup date settings
          this.loadDate();
          this.loadReturnDate();

          // Setup date settings
          this.loadTime();
          this.loadReturnTime();
        }

        // Setup number of people
        if (this.selectorModel.shopping_cart) {
          $(this.selectorModel.number_of_adults_selector).val(this.selectorModel.shopping_cart.number_of_adults);
        }
        if (this.selectorModel.shopping_cart) {
          $(this.selectorModel.number_of_children_selector).val(this.selectorModel.shopping_cart.number_of_children);
        }
        if (this.selectorModel.shopping_cart) {
          $(this.selectorModel.number_of_infants_selector).val(this.selectorModel.shopping_cart.number_of_infants);
        }

        // Setup round_trip
        if (this.selectorModel.shopping_cart && this.selectorModel.shopping_cart.round_trip) {
          $(this.selectorModel.round_trip_selector).filter('[value="true"]').attr('checked', 'true');
          $(this.selectorModel.round_trip_selector).trigger('change');
        }


    }
    
    /**
     * Load settings
     */
    this.loadSettings = function (initialize) {
      var self = this;

      commonLoader.show();
      return commonSettings.loadSettings(function(data){
          self.selectorModel.configuration = data;
          commonLoader.hide();
          if(initialize) {
            self.init();
          }
      });
    }

    /**
    * Load date
    */
    this.loadDate = function() {
      var date = null;
      // It is a shopping cart
      if (this.selectorModel.shopping_cart) {
        date = new Date(this.selectorModel.shopping_cart.date);
      }

      if (date) {
        $(this.selectorModel.date_selector).datepicker('setDate', date);
      }

    };

    /**
    * Load time
    */
    this.loadTime = function() {

      var date = moment($(this.selectorModel.date_selector).datepicker('getDate')).format('YYYY-MM-DD');  
      if (date) {
        this.selectorModel.loadHours(date);
      }
    };
    

    /**
    * Load date
    */
    this.loadReturnDate = function() {
      var date = null;
      // It is a shopping cart
      if (this.selectorModel.shopping_cart) {
        if (this.selectorModel.shopping_cart.round_trip && this.selectorModel.shopping_cart.return_date) {
          date = new Date(this.selectorModel.shopping_cart.return_date);
        }
        else if (this.selectorModel.shopping_cart.date) { // No return date => Take date
          date = new Date(this.selectorModel.shopping_cart.date);
        }
      }

      if (date) {
        $(this.selectorModel.return_date_selector).datepicker('setDate', date);
      }

      // If it is the return date selector => Setup the min date
      if (this.selectorModel.shopping_cart && this.selectorModel.shopping_cart.round_trip) {
        $(this.selectorModel.return_date_selector).datepicker('option', 'minDate', 
              $(this.selectorModel.date_selector).datepicker('getDate'));
      }


    };

    /**
    * Load time
    */
    this.loadReturnTime = function() {

      var date = moment($(this.selectorModel.return_date_selector).datepicker('getDate')).format('YYYY-MM-DD');  
      if (date) {
        this.selectorModel.loadReturnHours(date);
      }

    };

    /**
    * Load origin points
    */
    this.loadOriginPoints = function(idSelector) {
      console.log('loadOriginPoints');

      if (this.selectorModel.dataSourceOriginPoints) {
        this.addSelector(idSelector, 'dataSourceOriginPoints');
        return;
      }

      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/origin-points';
      var urlParams = [];
      if (this.selectorModel.requestLanguage != null) {
      urlParams.push('lang='+this.selectorModel.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
      urlParams.push('api_key='+commonServices.apiKey);
      }    
      if (urlParams.length > 0) {
      url += '?';
      url += urlParams.join('&');
      }

      // DataSource
      this.selectorModel.dataSourceOriginPoints = new RemoteDataSource(url,
        {
        'id':'id',
        'description': function(data) {
            return data.name;
        }});

      this.addSelector(idSelector, 'dataSourceOriginPoints');
    }

    /**
    * Load destination points
    */
    this.loadDestinationPoints = function(idSelector, clearInput, value) {
      console.log('loadDestinationPoints');

      var mySelector = $(this.selectorModel[idSelector + '_selector']);
      var mySource = (idSelector === 'destination_point') ? 'dataSourceDestinationPoints' : 'dataSourceReturnDestinationPoints';

      if (this.selectorModel[mySource]) {
        if (!mySelector.attr('disabled')) {
          mySelector.val('');
        } 
        else {
          this.addSelector(idSelector, mySource, clearInput);
          mySelector.attr('disabled', false);
        }
        //return; // It is not necessary because it avoids to reload destination points when origin point changes
      }

      var self = this;

      var originPointId = value || $(this.selectorModel.origin_point_selector).val();
      console.log(originPointId);

      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/destination-points';
      var urlParams = [];
      urlParams.push('origin_point_id='+encodeURIComponent(originPointId));
      if (this.selectorModel.requestLanguage != null) {
        urlParams.push('lang='+this.selectorModel.requestLanguage);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }    
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // DataSource
      this.selectorModel[mySource] = new RemoteDataSource(url,
          {
          'id':'id',
          'description': function(data) {
              return data.name;
          }});

      this.addSelector(idSelector, mySource, clearInput);
      mySelector.attr('disabled', false);
    }

    /**
    * Add data to inputs selects
    */
    this.addSelector = function (idSelector, idDataSource, clearInput) {
      var self = this;

      new SelectSelector(this.selectorModel[idSelector + '_id'], 
          this.selectorModel[idDataSource],
              null, 
              true, 
              i18next.t('selector.select_pickup_place'),
            function(data) {
              if (self.selectorModel.shopping_cart && !clearInput) {
                $(self.selectorModel[idSelector + '_selector']).val(self.selectorModel.shopping_cart[idSelector + '_id']);
              }
            });
    }

    /**
     * Start the component from shopping cart : Load the shopping cart information in the selector fields
     */
     this.startFromShoppingCart = function(shopping_cart) { /* Show the selector with the shopping cart information */

      this.selectorModel.shopping_cart = shopping_cart;
      this.selectorModel.loadedShoppingCart = true;
      this.init();

    }

    // ------------------------ Extract Agent Id ------------------------------
    this.extractAgentId = function() {

      var urlVars = commonSettings.getUrlVars();
      var agentId = null;  
      if (typeof urlVars['agentId'] != 'undefined') {
        agentId = decodeURIComponent(urlVars['agentId']);
        if (cookie.set) {
          cookie.set('__mb_agent_id', agentId, {expires: 14});
        }
      }
      else {
        if (cookie.get) {
          agentId = cookie.get('__mb_agent_id');
        }
      }
      if (agentId != null) {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "agent_id");
        input.setAttribute("value", agentId);
        $(this.selectorModel.form_selector).append(input);
      }

    }

    /**
    * Setup controls
    */
    this.setupControls = function () {
      var self = this;

      // ------------------------ Setup controls --------------------------------

      // Origin point change
      $(this.selectorModel.origin_point_selector).on('change', function(value) {
        self.loadDestinationPoints('destination_point', true);
      });
      // Return origin point change
      $(this.selectorModel.return_origin_point_selector).on('change', function(value) {
        self.loadDestinationPoints('return_destination_point', true);
      });

      // Setup date control
      this.setupDateControl();
      this.setupReturnDateControl();

      // On Change round trip
      $(this.selectorModel.round_trip_selector).on('change', function(event) {
        self.selectorController.rountTripChanged(event);
      });
      this.setupFormControl();
      $(this.selectorModel.form_selector).attr('action', commonServices.transferChooseProductUrl);

      $.validator.addMethod('twoway_same_origin', function(value) {
        return $(self.selectorModel.return_origin_point_selector).val() !== value;
      });

      this.extractAgentId();

    }

    this.setupDateControl = function () {
      var self = this;

      $.datepicker.setDefaults( $.datepicker.regional[this.selectorModel.requestLanguage || 'es'] );
      var locale = $.datepicker.regional[this.selectorModel.requestLanguage || 'es'];
      var maxDate = moment().add(365, 'days').tz(this.selectorModel.configuration.timezone).format(this.selectorModel.configuration.dateFormat);
      $(this.selectorModel.date_selector).datepicker({
        numberOfMonths:1,
        maxDate: maxDate,
        minDate: new Date(),
        dateFormat: 'dd/mm/yy',
        beforeShow: function(element, instance) {
          console.log('before_show Date');
          if (instance.lastVal) {
            console.log('lastVal:'+instance.lastVal);
            var date = moment(instance.lastVal, self.selectorModel.configuration.dateFormat);
          }
          else {
            var date = moment();
          }
          self.selectorModel.loadDays(date.year(), date.month()+1);
        },
        beforeShowDay: function(date) {
          if (self.selectorModel.dates == null) {
            return [false];
          }
          var idx = self.selectorModel.dates.findIndex(function(element){
                      return element == moment(date).format('YYYY-MM-DD');
                    }); 
          if (idx > -1) {
            return [true];
          }     
          else {
            return [false];
          }              
        },
        onChangeMonthYear: function(year, month, instance) {
           console.log('date changed month : ' + month+ ' year: '+year);
           // if the user has selected a origin point
             if ($(self.selectorModel.origin_point_selector).val() != null &&
                 $(self.selectorModel.origin_point_selector).val() != '') { 
               self.selectorModel.loadDays(year, month);         
             }         
        },
        onSelect: function (value, element) {
          self.selectorController.dateChanged(element);
        },
      }, locale);

      // Avoid Google Automatic Translation
      $('.ui-datepicker').addClass('notranslate');
    }

    this.setupReturnDateControl = function () {
      var self = this;

      $.datepicker.setDefaults( $.datepicker.regional[this.selectorModel.requestLanguage || 'es'] );
      var locale = $.datepicker.regional[this.selectorModel.requestLanguage || 'es'];
      var maxDate = moment().add(365, 'days').tz(this.selectorModel.configuration.timezone).format(this.selectorModel.configuration.dateFormat);
      $(this.selectorModel.return_date_selector).datepicker({
        numberOfMonths:1,
        maxDate: maxDate,
        minDate: new Date(),
        dateFormat: 'dd/mm/yy',
        beforeShow: function(element, instance) {
          console.log('before_show ReturnDate');
          if (instance.lastVal) {
            console.log('lastVal:'+instance.lastVal);
            var date = moment(instance.lastVal, self.selectorModel.configuration.dateFormat);
          }
          else {
            var date = moment();
          }
          self.selectorModel.loadReturnDays(date.year(), date.month()+1);
        },
        beforeShowDay: function(date) {
          if (self.selectorModel.returnDates == null) {
            return [false];
          }          
          var idx = self.selectorModel.returnDates.findIndex(function(element){
                      return element == moment(date).format('YYYY-MM-DD');
                    }); 
          if (idx > -1) {
            return [true];
          }     
          else {
            return [false];
          }              
        },
        onChangeMonthYear: function(year, month, instance) {
           console.log('return date changed month : ' + month+ ' year: '+year);
           // if the user has selected a origin point
             if ($(self.selectorModel.return_origin_point_selector).val() != null &&
                 $(self.selectorModel.return_origin_point_selector).val() != '') { 
               self.selectorModel.loadReturnDays(year, month);         
             }         
        },
        onSelect: function (value, element) {
          self.selectorController.returnDateChanged(element);
        },
      }, locale);

      // Avoid Google Automatic Translation
      $('.ui-datepicker').addClass('notranslate');
    }

    /**
     * Setup the selector form templ
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
    this.setupSelectorFormTmpl = function() {

      // The selector form fields are defined in a micro-template
      if (document.getElementById(this.selectorModel.form_selector_tmpl)) {
        console.log('transfer-custom-form-selector');
        // Load the template
        var html = tmpl(this.selectorModel.form_selector_tmpl)({configuration: this.selectorModel.configuration});
        // Assign to the form
        $(this.selectorModel.form_selector).append(html);
      }

      this.setupControls();

    }

    this.setupFormControl = function () {
      var self = this;

      $(this.selectorModel.form_selector).validate({
        invalidHandler: function(form) {
          $(self.selectorModel.form_selector + ' label.form-reservation-error').remove();
        },
        rules: {
            date: {
                required: self.selectorModel.date_selector,
            },
            time: {
                required: self.selectorModel.time_selector,
            },
            origin_point_id: {
                required: self.selectorModel.origin_point_selector,
            },
            destination_point_id: {
                required: self.selectorModel.destination_point_selector,
            },
            round_trip: {
                required: self.selectorModel.round_trip_selector,
            },
            return_date: {
                required: self.selectorModel.return_date_selector + ':visible',
            },
            return_time: {
                required: self.selectorModel.return_time_selector + ':visible',
            },
            return_origin_point_id: {
                required: self.selectorModel.return_origin_point_selector + ':visible',
            },
            return_destination_point_id: {
                required: self.selectorModel.return_destination_point_selector + ':visible',
                twoway_same_origin: true,
            },
            number_of_adults: {
                required: self.selectorModel.number_of_adults_selector
            },
            number_of_children: {
                required: self.selectorModel.number_of_children_selector
            },
            number_of_infants: {
                required: self.selectorModel.number_of_infants_selector
            },           
        },
        messages: {
            date: {
                required: i18next.t('common.required'),
            },
            time: {
                required: i18next.t('common.required'),
            },
            origin_point_id: {
                required: i18next.t('common.required'),
            },
            destination_point_id: {
                required: i18next.t('common.required'),
            },
            round_trip: {
                required: i18next.t('common.required'),
            },
            return_date: {
                required: i18next.t('common.required'),
            },
            return_time: {
                required: i18next.t('common.required'),
            },
            return_origin_point_id: {
                required: i18next.t('common.required'),
            },
            return_destination_point_id: {
                required: i18next.t('common.required'),
                twoway_same_origin: 'Warning: Origen y destino no pueden ser iguales', // TODO
            },
            number_of_adults: {
                required: i18next.t('common.required'),
            },
            number_of_children: {
                required: i18next.t('common.required'),
            },
            number_of_infants: {
                required: i18next.t('common.required'),
            },
        },
        errorPlacement: function (error, element) {

          error.insertAfter(element.parent());
    
        },
        errorClass : 'form-reservation-error'
     });
    }

    // ------------------------ Update GUI ------------------------------------

    /**
     * Update the GUI when selector fields changes
     */
    this.update = function(action, id) {

      var self = this;

      switch (action) {
        case 'days':
          if (id == 'date') {
            $(this.selectorModel.date_selector).datepicker('refresh');
            // Enable the control
            if ($(this.selectorModel.date_selector).attr('disabled')) {  
              $(this.selectorModel.date_selector).attr('disabled', false);
            }              
          }
          else if (id == 'return_date') {
            $(this.selectorModel.return_date_selector).datepicker('refresh');
          }
          break;
        case 'hours':
          if (id == 'time') {
            var dataSource = new MemoryDataSource(this.selectorModel.times);
            var time = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.time : null;
            if (time != null && this.selectorModel.times.indexOf(time) == -1) {
              time = null;
            }            
            var timeSelector = new SelectSelector(this.selectorModel.time_id,
                                                  dataSource, 
                                                  time, 
                                                  true, 
                                                  'hh:mm',
                                                  function() {
                                                      // After load data => Select current value
                                                      if (time != null) {
                                                        $(self.selectorModel.time_selector).val(time);
                                                      }
                                                  } );
            // Enable the control
            if ($(this.selectorModel.time_selector).attr('disabled')) {   
              $(this.selectorModel.time_selector).attr('disabled', false);
            } 

          }
          else if (id == 'return_time') {
            var dataSource = new MemoryDataSource(this.selectorModel.returnTimes);
            var returnTime = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.return_time : null;
            if (returnTime != null && this.selectorModel.returnTimes.indexOf(returnTime) == -1) {
              returnTime = null;
            }
            var pickupTime = new SelectSelector(this.selectorModel.return_time_id,
                                                dataSource, 
                                                returnTime, 
                                                true, 
                                                'hh:mm',
                                                function() {
                                                    // After load data => Select current value
                                                    if (returnTime != null) {
                                                      $(self.selectorModel.return_time_selector).val(returnTime);
                                                    }
                                                } );
            // Enable the control
            if ($(this.selectorModel.return_time_selector).attr('disabled')) {   
              $(this.selectorModel.return_time_selector).attr('disabled', false);
            }            
          }
          break;
      }

    }

  };

  var SelectorTransfer = function() {

    console.log('Selector Transfer');

    this.model = new SelectorTransferModel();
    this.controller = new SelectorTransferController();
    this.view = new SelectorTransferView(this.model, this.controller);

    this.controller.setSelectorView(this.view);
    this.controller.setSelectorModel(this.model);
    this.model.setSelectorView(this.view);

    $(this.model.return_block_selector).hide();
    $(this.model.destination_point_selector).attr('disabled', true);
    $(this.model.return_destination_point_selector).attr('disabled', true);

  }

  return SelectorTransfer;

});
