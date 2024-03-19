define('SelectorRent', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings', 'commonTranslations', 'commonLoader',
         'i18next', 'moment','ysdtemplate', 'customCookie', 'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation', 'moment-timezone'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,
                  commonServices, commonSettings, commonTranslations, commonLoader, 
                  i18next, moment, tmpl, customCookie) {

  /***************************************************************************
   *
   * Selector Rent Model
   * 
   * 
   * - Dates period
   * - Staring date and duration
   * 
   *
   ***************************************************************************/
  var SelectorRentModel = function() {

    this.selectorView = null;

    // == Selectors

    // Search form
    this.form_selector = 'form[name=search_form]';
    // Search form template
    this.form_selector_tmpl = 'form_selector_tmpl';

    // Simple location
    this.simple_location_id = 'simple_location_id';
    this.simple_location_selector = '#simple_location_id';

    // Pickup place
    this.pickup_place_id = 'pickup_place';
    this.pickup_place_selector = '#pickup_place';
    this.pickup_place_other_id = 'pickup_place_other';
    this.pickup_place_other_selector = '#pickup_place_other';
    this.another_pickup_place_group_selector = '#another_pickup_place_group';
    this.custom_pickup_place_selector = 'input[name=custom_pickup_place]';
    this.pickup_place_group_selector = '.pickup_place_group';
    this.another_pickup_place_group_close = '.another_pickup_place_group_close';
    
    // Return place
    this.return_place_id = 'return_place';   
    this.return_place_selector = '#return_place';
    this.return_place_other_id = 'return_place_other';
    this.return_place_other_selector = '#return_place_other';
    this.another_return_place_group_selector = '#another_return_place_group';    
    this.custom_return_place_selector = 'input[name=custom_return_place]';
    this.return_place_group_selector = '.return_place_group';
    this.another_return_place_group_close = '.another_return_place_group_close';
    
    // Date From
    this.date_from_selector = '#date_from';
    // Time From
    this.time_from_id = 'time_from';
    this.time_from_selector = '#time_from';
    // Date To
    this.date_to_selector = '#date_to';
    // Time To
    this.time_to_id = 'time_to';        
    this.time_to_selector = '#time_to'; 
    // Duration
    this.duration_id = 'renting_duration';
    this.duration_selector = '#renting_duration';

    // Promotion Code
    this.promotion_code_selector = '#promotion_code';
    // Number of products
    this.number_of_products_selector = '#number_of_products';
    // Family
    this.family_id = 'family_id';
    this.family_id_selector = '#family_id';
    this.family_selector = '.family';   
    // Rental Location Code
    this.rental_location_code = 'rental_location_code',
    this.rental_location_code_selector = '#rental_location_code',   
    this.rental_location_selector = '.rental_location', 
     // Driver age rule
     this.driver_age_rule_id = 'driver_age_rule_id',
     this.driver_age_rule_id_selector = '#driver_age_rule_id',   
     this.driver_age_rule_selector = '.driver_age_rule';
    // Accept age
    this.accept_age_selector = '#accept_age';

    // == State variables

    this.dataSourcePickupPlaces = null; // Pickup places datasource
    this.dataSourceReturnPlaces = null; // Return places datasource

    this.requestLanguage = null;
    this.configuration = null;
    this.shopping_cart = null;
    this.loadedShoppingCart = false;
    this.pickupDays = []; // Available pickup days
    this.returnDays = []; // Available return days
    this.pickupHours = []; // Available pickup hours
    this.returnHours = []; // Available return hours
    this.families = []; // Families
    this.rentalLocations = []; // Rental Locations
    this.driverAgeRules = []; // Age rules
    this.durations = []; // Durations
    this.promotionCode = null; // The promotion code

    this.dateToMinDate = null;

    this.setSelectorView = function(_selectorView) {
      this.selectorView = _selectorView;
    }

     /**
     * Load families
     */ 
    this.loadFamilies = function() { /* Load families */

      console.log('loadFamilies');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/families';

      var urlParams = [];
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }  
      if (this.requestLanguage != null) {
        urlParams.push('lang='+this.requestLanguage);
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
          self.families = data;
          var description = null;
          for (var idx=0;idx<self.families.length;idx++){
            description = '';
            if (self.families[idx]['parent_id'] && self.families[idx]['parent_id'] !== '') {
              description += ' - ';
            }
            description += self.families[idx]['name']
            self.families[idx]['description'] = description;
          }          
          self.selectorView.update('families', null);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });      
    };

    /**
     * Load rental locations
     */ 
    this.loadRentalLocations = function() { /* Load rental locations */

      console.log('loadRentalLocations');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/rental-locations';
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '?api_key='+commonServices.apiKey;
      }  
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.rentalLocations = data;
          for (var idx=0;idx<self.rentalLocations.length;idx++){
            self.rentalLocations[idx]['id'] = self.rentalLocations[idx]['code'];
            self.rentalLocations[idx]['description'] =  self.rentalLocations[idx]['name'];
          }          
          self.selectorView.update('rentalLocations', null);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });      
    };

    /**
     * Load age rules
     */ 
    this.loadAgeRules = function() { /* Load age rules */
      console.log('loadAgeRules');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/driver-age-rules';
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '?api_key='+commonServices.apiKey;
      }  
      // Request
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.driverAgeRules = data;

          self.selectorView.update('driverAgeRules', null);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });      
    };  

    /**
     * Access the API to get the available pickup days in a month
     */
    this.loadPickupDays = function(year, month) { /* Load pickup days */
      console.log('loadPickupDays. year='+year+' month='+month);
      this.startDate = moment([year, month - 1]);
      this.endDate = moment(this.startDate).endOf('month');
      var self = this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/dates?from='+
                this.startDate.format('YYYY-MM-DD')+
                '&to='+this.endDate.format('YYYY-MM-DD')+
                '&action=deliveries';
      if (this.configuration.pickupReturnPlace && $(this.pickup_place_selector).val() != '') {
        url += '&place='+$(this.pickup_place_selector).val();
      }
      if (this.selectorView.applyRentalLocationSelector() && $(this.rental_location_code_selector).val() != '') {
        url += '&rental_location_code='+$(this.rental_location_code_selector).val();
      }  
      else if (this.selectorView.usedFixedRentalLocation() && this.selectorView.fixedRentalLocationValue() != '') {
        url += '&rental_location_code='+this.selectorView.fixedRentalLocationValue();
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
          self.pickupDays = data;
          self.selectorView.update('days', 'date_from');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Access the  API to get the available return days in a month
     */
    this.loadReturnDays = function(year, month) { /* Load return days */
      console.log('loadReturnDays. year='+year+' month='+month);
      this.startDate = moment([year, month - 1]);
      this.endDate = moment(this.startDate).endOf('month');
      var self = this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/dates?from='+
                this.startDate.format('YYYY-MM-DD')+
                '&to='+this.endDate.format('YYYY-MM-DD')+
                '&action=collections';
      if (this.configuration.pickupReturnPlace && $(this.return_place_selector).val() != '') {
        url += '&place='+$(this.return_place_selector).val();
      }        
      if (this.selectorView.applyRentalLocationSelector() && $(this.rental_location_code_selector).val() != '') {
        url += '&rental_location_code='+$(this.rental_location_code_selector).val();
      } else if (this.selectorView.usedFixedRentalLocation() && this.selectorView.fixedRentalLocationValue() != '') {
        url += '&rental_location_code='+this.selectorView.fixedRentalLocationValue();
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
          self.returnDays = data;
          self.selectorView.update('days', 'date_to');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Access the API to get the available pickup hours in a date
     */
    this.loadPickupHours = function(date) { /* Load pickup hours */
      console.log('loadPickupHours. date:'+date);
      var self=this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date+'&action=deliveries';
      if (this.configuration.pickupReturnPlace && $(this.pickup_place_selector).val() != '') {
        url += '&place='+$(this.pickup_place_selector).val();
      }         
      if (this.selectorView.applyRentalLocationSelector() && $(this.rental_location_code_selector).val() != '') {
        url += '&rental_location_code='+$(this.rental_location_code_selector).val();
      } else if (this.selectorView.usedFixedRentalLocation() && this.selectorView.fixedRentalLocationValue() != '') {
        url += '&rental_location_code='+this.selectorView.fixedRentalLocationValue();
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
          self.pickupHours = data;
          self.selectorView.update('hours', 'time_from');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };

    /**
     * Access the API to get the available return hours in a date
     */
    this.loadReturnHours = function(date) { /* Load return hours */
      console.log('loadPickupHours. date:'+date);
      var self=this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date+'&action=collections';
      if (this.configuration.pickupReturnPlace && $(this.return_place_selector).val() != '') {
        url += '&place='+$(this.return_place_selector).val();
      }    
      if (this.selectorView.applyRentalLocationSelector() && $(this.rental_location_code_selector).val() != '') {
        url += '&rental_location_code='+$(this.rental_location_code_selector).val();
      } else if (this.selectorView.usedFixedRentalLocation() && this.selectorView.fixedRentalLocationValue() != '') {
        url += '&rental_location_code='+this.selectorView.fixedRentalLocationValue();
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
          self.returnHours = data;
          self.selectorView.update('hours', 'time_to');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    };  

    /**
     * Access the API to get the durations
     */
    this.loadDurations = function(date) { /* Load durations */
      var self=this;
      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/durations';
      var urlParams = [];
      urlParams.push('date='+date);
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
      // Request        
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.durations = [
            {
              value: '',
              text: ''
            },
            ...data,
          ];
          self.selectorView.update('durations', null);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    }; 

   
  };

  /***************************************************************************
   *
   * Selector Rent Controller
   *
   ***************************************************************************/
  var SelectorRentController = function() {

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
     * On Window scroll if sticky hide Google API controls
     */
    this.windowOnScroll = function() {

      if ($("#form-selector").hasClass("flex-form-sticky")) {
        if ($('.pac-container').is(':visible')) {
          $('.pac-container').hide();
          if ($(this.selectorModel.pickup_place_other_selector).is(':focus')) {
            $(this.selectorModel.pickup_place_other_selector).val('');
          }
          if ($(this.selectorModel.return_place_other_selector).is(':focus')) {
            $(this.selectorModel.return_place_other_selector).val('');
          }          
        }
      }

    }

    /**
     * Rental location changed
     */ 
    this.rentalLocationChanged = function() {

       console.log('rental location changed');

       // Clear shopping cart data to avoid to be reloaded
       if (this.selectorModel.shopping_cart) {
         this.selectorModel.shopping_cart.date_from = null;
         this.selectorModel.shopping_cart.time_from = null;
         this.selectorModel.shopping_cart.date_to = null;
         this.selectorModel.shopping_cart.time_to = null;
         this.selectorModel.shopping_cart.renting_duration = null;
       }  

       // -- Enabled date from
       $(this.selectorModel.date_from_selector).attr('disabled', false);

       // -- Disable fields selectors (return place, time from ,date to, time to)

       // Disable time from
       $(this.selectorModel.time_from_selector).attr('disabled', true);
       // Disable date to
       $(this.selectorModel.date_to_selector).attr('disabled', true);
       // Disable time to
       $(this.selectorModel.time_to_selector).attr('disabled', true);
       // Disable duration
       $(this.selectorModel.duration_selector).attr('disabled', true);

       // Initialize date from, time from, date to and time to
       $(this.selectorModel.date_from_selector).datepicker('setDate', null);
       if (this.selectorModel.configuration.timeToFrom) {
         $(this.selectorModel.time_from_selector).val('');
       }
       $(this.selectorModel.date_to_selector).datepicker('setDate', null);
       if (this.selectorModel.configuration.timeToFrom) {
         $(this.selectorModel.time_to_selector).val('');
       }

      if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
        $(this.selectorModel.duration_selector).val('');
      }

    }

    /**
     * Pickup place changed
     * 
     * When loading from shopping cart this method is not called because it is initialized on
     * loadPickupPlaces
     */ 
    this.pickupPlaceChanged = function() { 

       console.log('pickup place changed');
       
       // Clear shopping cart data to avoid to be reloaded
       if (this.selectorModel.shopping_cart) {
         this.selectorModel.shopping_cart.date_from = null;
         this.selectorModel.shopping_cart.time_from = null;
         this.selectorModel.shopping_cart.date_to = null;
         this.selectorModel.shopping_cart.time_to = null;
         this.selectorModel.shopping_cart.renting_duration = null;
         this.selectorModel.shopping_cart.pickup_place = null;
         this.selectorModel.shopping_cart.custom_pickup_place = null;
         this.selectorModel.shopping_cart.pickup_place_other = null;
         this.selectorModel.shopping_cart.return_place = null;
         this.selectorModel.shopping_cart.custom_return_place = null;
         this.selectorModel.shopping_cart.return_place_other = null;
       }   

       // -- Enabled date from
       $(this.selectorModel.date_from_selector).attr('disabled', false);

       // -- Disable fields selectors (return place, time from ,date to, time to)

       // Disable return places
       $(this.selectorModel.return_place_selector).attr('disabled', true);
       // Disable time from
       $(this.selectorModel.time_from_selector).attr('disabled', true);
       // Disable date to
       $(this.selectorModel.date_to_selector).attr('disabled', true);
       // Disable time to
       $(this.selectorModel.time_to_selector).attr('disabled', true);
       // Disable duration
       $(this.selectorModel.duration_selector).attr('disabled', true);

       // Initialize date from, time from, date to and time to
       $(this.selectorModel.date_from_selector).datepicker('setDate', null);
       if (this.selectorModel.configuration.timeToFrom) {
         $(this.selectorModel.time_from_selector).val('');
       }
       $(this.selectorModel.date_to_selector).datepicker('setDate', null);
       if (this.selectorModel.configuration.timeToFrom) {
         $(this.selectorModel.time_to_selector).val('');
       }

       if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
        $(this.selectorModel.duration_selector).val('');
      }

       // Custom address allowed
       if (this.selectorModel.configuration.customPickupReturnPlaces) {          
         // User selects custom address
         if ($(this.selectorModel.pickup_place_selector).val() == 'other') {
             $(this.selectorModel.custom_pickup_place_selector).val('true');
             $(this.selectorModel.another_pickup_place_group_selector).show();
             $(this.selectorModel.pickup_place_group_selector).hide();
         }
         else { // User selects pickup place from the list
             $(this.selectorModel.custom_pickup_place_selector).val('false');
             $(this.selectorModel.pickup_place_other_selector).val('');
             $(this.selectorModel.another_pickup_place_group_selector).hide();
             $(this.selectorModel.pickup_place_group_selector).show();
         }
       }

       // Take into account if prefill selector
       if (this.selectorModel.configuration.prefillSelector) {
         // Update the pickup place
         this.selectorView.update('place', 'pickup_place');
       }
       else {
         // Default behaviour when no prefill => load return places when change pickup place
         this.selectorView.loadReturnPlaces(true);
       } 
    }

    /**
     * Pickup place custom address autocomplete changed
     *
     * - Assigns the custom pickup place to the custom return place
     *
     */
    this.customPickupPlaceValueChanged = function() {

      $(this.selectorModel.return_place_selector).val('other');
      $(this.selectorModel.return_place_other_selector).val($(this.selectorModel.pickup_place_other_selector).val());
      $(this.selectorModel.custom_return_place_selector).val('true');
      $(this.selectorModel.another_return_place_group_selector).show();        

    }

    /**
     * Pickup place custom address close click
     *
     * - The user will select the pickup place from the list
     * 
     */
    this.customPickupPlaceCloseBtnClick = function() {
      $(this.selectorModel.pickup_place_selector).val('');
      $(this.selectorModel.pickup_place_other_selector).val('');
      $(this.selectorModel.custom_pickup_place_selector).val('false');
      $(this.selectorModel.pickup_place_group_selector).show();
      $(this.selectorModel.another_pickup_place_group_selector).hide();
    }

    /**
     * Return place changed
     * 
     * When loading from shopping cart this method is not called because it is initialized on
     * loadPickupPlaces
     */ 
    this.returnPlaceChanged = function() { 

        console.log('return place changed');

        // Custom address allowed
        if (this.selectorModel.configuration.customPickupReturnPlaces) {
          // User selects custom address
          if ($(this.selectorModel.return_place_selector).val() == 'other') {
              $(this.selectorModel.custom_return_place_selector).val('true');
              $(this.selectorModel.another_return_place_group_selector).show();
              $(this.selectorModel.return_place_group_selector).hide();
          }
          else { // User selects pickup place from the list
              $(this.selectorModel.custom_return_place_selector).val('false');
              $(this.selectorModel.another_return_place_group_selector).hide();
              $(this.selectorModel.return_place_group_selector).show();
          }
        }

        // Enable date to
        if ($(this.selectorModel.date_to_selector).attr('disabled')) {  
          $(this.selectorModel.date_to_selector).attr('disabled', false);
        }  

        // Disable time to
        $(this.selectorModel.time_to_selector).attr('disabled', true);

        // Initialize values

        // - Initialize date_to 
        $(this.selectorModel.date_to_selector).datepicker('setDate', null);
        // - Initialize time_to
        if (this.selectorModel.configuration.timeToFrom) {
          $(this.selectorModel.time_to_selector).val('');
        }

        // Take into account if prefill selector        
        if (this.selectorModel.configuration.prefillSelector) {
          // Update the pickup place
          this.selectorView.update('place', 'return_place');
        }

    }

    /**
     * Return place custom address close click
     */
    this.customReturnPlaceCloseBtnClick = function() {
      $(this.selectorModel.return_place_selector).val('');
      $(this.selectorModel.return_place_other_selector).val('');
      $(this.selectorModel.custom_return_place_selector).val('false');      
      $(this.selectorModel.return_place_group_selector).show();
      $(this.selectorModel.another_return_place_group_selector).hide();
    },
    
    /**
     * Date From changed
     */
    this.dateFromChanged = function() {

        console.log('date from changed');
       
        // Clear time_from / date_to / time_to
        if (this.selectorModel.shopping_cart) {
          this.selectorModel.shopping_cart.date_from = null;
          this.selectorModel.shopping_cart.time_from = null;
          this.selectorModel.shopping_cart.date_to = null;
          this.selectorModel.shopping_cart.time_to = null;
          this.selectorModel.shopping_cart.renting_duration = null;
        } 

        // == Date To
        this.selectorView.setupDateToMinValue();
        $(this.selectorModel.date_to_selector).datepicker('setDate', null);
        // Enable the control
        if ($(this.selectorModel.date_to_selector).attr('disabled')) {  
          $(this.selectorModel.date_to_selector).attr('disabled', false);
        }  

        // If prefill model => loadReturnPlaces 
        // When setup the date from load return places
        // because of paralelism execution of preloading causes the date_to
        // to be empty if return places are loaded before date_from is setup
        if (this.selectorModel.configuration.prefillSelector && 
            this.selectorModel.configuration.pickupReturnPlace) {
          this.selectorView.loadReturnPlaces(true);
        }

        // == Time From
        if (this.selectorModel.configuration.timeToFrom) {
          // Initialize time from
          $(this.selectorModel.time_from_selector).val('');

          // Initialize time to
          $(this.selectorModel.time_to_selector).val('');

          // Load Pickup Hours
          this.selectorView.loadPickupHours();

        } else if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
          // == Duration
          this.selectorView.loadDurations();      
        }
    }


    /**
     * Date to changed
     */
    this.dateToChanged = function() {

      console.log('date to changed');

      if (this.selectorModel.configuration.timeToFrom) {
        // Enable time to     
        if ($(this.selectorModel.time_to_selector).attr('disabled')) {   
          $(this.selectorModel.time_to_selector).attr('disabled', false);
        }
        // Initialize time to
        $(this.selectorModel.time_to_selector).val('');
        // Load return times
        this.selectorView.loadReturnHours();
      }  

    }

    /**
     * Time from changed
     */ 
    this.timeFromChanged = function() {

      console.log('time from changed');
      if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
        this.selectorView.loadDurations();
      }

    }

  };


  /***************************************************************************
   *
   * Selector Rent View
   *
   ***************************************************************************/
  var SelectorRentView = function(_selectorModel, _selectorController) {

    this.selectorModel = _selectorModel;
    this.selectorController = _selectorController;

    this.init = function() {

        // Initialize i18next for translations
        i18next.init({  
                        lng: this.selectorModel.requestLanguage,
                        resources: commonTranslations
                     }, 
                     function (error, t) {
                        // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                        //jqueryI18next.init(i18next, $);
                        // Localize UI
                        //$('.nav').localize();
                     });

        // Setup on scroll => Google Location API integration
        var self = this;
        $(window).on("scroll", function() {
          self.selectorController.windowOnScroll();
        });


    }

    /**
     *  Used fixed rental location
     */ 
    this.usedFixedRentalLocation = function() {
      return $(this.selectorModel.form_selector).find('input[type=hidden][name=rental_location_code]').length > 0;
    }

    /**
     *  Fixed rental location value
     */ 
    this.fixedRentalLocationValue = function() {
      return $(this.selectorModel.form_selector).find('input[type=hidden][name=rental_location_code]').val();
    }

    /**
     *  Check if rental location is not hidden
     */ 
    this.applyRentalLocationSelector = function() {

      var not_hidden_rental_location_code = ($(this.selectorModel.form_selector).find('input[type=hidden][name=rental_location_code]').length == 0);
      return (not_hidden_rental_location_code && this.selectorModel.configuration.selectorRentalLocation);

    }

    // ------------------------ Start -----------------------------------------

    /**
     * Start the component empty
     */
    this.startEmpty = function() {

      this.prepareSelector();

      // Disable selector controls  
      $(this.selectorModel.pickup_place_selector).attr('disabled', true);
      $(this.selectorModel.date_from_selector).attr('disabled', true);
      $(this.selectorModel.time_from_selector).attr('disabled', true);
      $(this.selectorModel.return_place_selector).attr('disabled', true);
      $(this.selectorModel.date_to_selector).attr('disabled', true);  
      $(this.selectorModel.time_to_selector).attr('disabled', true);
      $(this.selectorModel.duration_selector).attr('disabled', true);

      // Start loading first data
      if (this.selectorModel.configuration.pickupReturnPlace) {
        this.loadPickupPlaces(); // The other fields are automatically assigned after pickup_place assignation
      }
      else {
        if (!this.selectorModel.configuration.simpleLocation && 
             this.applyRentalLocationSelector()) {
          this.loadRentalLocations();
        }
        else {
          var date = moment();
          this.selectorModel.loadPickupDays(date.year(), date.month()+1);
        }
      }

      // Load age rules
      if ( this.selectorModel.configuration.useDriverAgeRules) {
        this.loadAgeRules();
      }

      // Load families
      if (this.selectorModel.configuration.selectFamily) {
        this.loadFamilies();
      }

    }

    /**
     * Start the component from shopping cart : Load the shopping cart information in the selector fields
     */
    this.startFromShoppingCart = function(shopping_cart) { /* Show the selector with the shopping cart information */

      this.selectorModel.shopping_cart = shopping_cart;

      this.prepareSelector();

      // Initialize number of products
      $(this.selectorModel.number_of_products_selector).val(shopping_cart.number_of_products);

      // It loads delivery place/hour/time and collection place/hour/time
      if (this.selectorModel.configuration.pickupReturnPlace) { 
        // If custom pickup place
        if (shopping_cart.custom_pickup_place) {
          $(this.selectorModel.another_pickup_place_group_selector).show();
        }        
        // If custom return place
        if (shopping_cart.custom_return_place) {
          $(this.selectorModel.another_return_place_group_selector).show();
        }        
        this.loadPickupPlaces(); // The other fields are automatically assigned after pickup_place assignation
      }
      else {

        // Load rental locations
        if (!this.selectorModel.configuration.simpleLocation && 
            this.applyRentalLocationSelector()) {
          this.loadRentalLocations();
        }

        // No delivery/collection place => Directly assign date_from and date_to from shopping_cart
        var date_from = moment(shopping_cart.date_from).format(this.selectorModel.configuration.dateFormat); 
        var date_to = moment(shopping_cart.date_to).format(this.selectorModel.configuration.dateFormat); 
        $(this.selectorModel.date_from_selector).datepicker('setDate', date_from); // It causes change month => load the calendar days
        $(this.selectorModel.date_to_selector).datepicker('setDate', date_to); // It causes the month to change => load the calendar days

        // Load pickup hours
        if (this.selectorModel.configuration.timeToFrom) {
          this.loadPickupHours();
          this.loadReturnHours();
        }
      }

      // Load age rules
      if ( this.selectorModel.configuration.useDriverAgeRules) {
        this.loadAgeRules();
      }

      if (this.selectorModel.configuration.selectFamily) {
        this.loadFamilies();
      }

    }

   /**
     * Prepare the selector
     */
    this.prepareSelector = function() {

        // Setup Form
        this.setupSelectorFormTmpl();

        // Setup UI
        $(this.selectorModel.form_selector).attr('action', commonServices.chooseProductUrl);
        
        // Extract choose product parameters
        this.extractChooseProductParameters();

        // Extract agent Id from location 
        this.extractAgentId();

        // Setup simple location id
        if (this.selectorModel.configuration.simpleLocation) {
          this.setupSimpleLocation();
        }        

        // Setup pickup/return places
        if (this.selectorModel.configuration.pickupReturnPlace) {
          this.setupPickupReturnPlace();
        }
        else {
          if (this.applyRentalLocationSelector()) {
            this.setupRentalLocations();
          }         
        }
        
        // Setup dates
        this.setupDateControls();
        
        // Setup time from / to
        if (this.selectorModel.configuration.timeToFrom) {
          this.setupTimeToFrom();
        }

        // Setup validation
        this.setupValidation();
    }

    /**
     * Extract parameters
     */ 
    this.extractChooseProductParameters = function() {

        // Append URL query string as hidden input
        var urlVars = commonSettings.getUrlVarsFromString(commonServices.chooseProductUrl);
        for (var idx in urlVars) {
          if (idx != 'agentId' && typeof urlVars[idx] != 'undefined' ) {
            var input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", idx);
            input.setAttribute("value", urlVars[idx]);
            $(this.selectorModel.form_selector).append(input);
          }
        }

    }

    // ------------------------ Extract Agent Id ------------------------------

    this.extractAgentId = function() {

      var urlVars = commonSettings.getUrlVars();
      var agentId = null;  
      if (typeof urlVars['agentId'] != 'undefined') {
        agentId = decodeURIComponent(urlVars['agentId']);
        customCookie.set('__mb_agent_id', agentId, {expires: 14});      
      }
      else if (typeof urlVars['agentID'] != 'undefined') {
        agentId = decodeURIComponent(urlVars['agentID']);
        customCookie.set('__mb_agent_id', agentId, {expires: 14});      
      }      
      else {
        agentId = customCookie.get('__mb_agent_id');  
      }
      if (agentId != null) {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "agent_id");
        input.setAttribute("value", agentId);
        $(this.selectorModel.form_selector).append(input);
      }

    }


    // ------------------------ Setup controls --------------------------------

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
    this.setupSelectorFormTmpl = function() {

      // The selector form fields are defined in a micro-template
      if (document.getElementById(this.selectorModel.form_selector_tmpl)) {
        console.log(this.selectorModel.configuration);
        var not_hidden_rental_location_code = false;
        var not_hidden_family_id = false;
        if (this.selectorModel.shopping_cart) {
          not_hidden_family_id = !this.selectorModel.shopping_cart.engine_fixed_family;
          not_hidden_rental_location_code = !this.selectorModel.shopping_cart.engine_fixed_rental_location;
        }
        else {
          // Check if forced hidden family_id
          not_hidden_family_id = ($(this.selectorModel.form_selector).find('input[type=hidden][name=family_id]').length == 0);
          // Check if forced hidden rental_location_code
          not_hidden_rental_location_code = ($(this.selectorModel.form_selector).find('input[type=hidden][name=rental_location_code]').length == 0);
        }

        // Load the template
        var html = tmpl(this.selectorModel.form_selector_tmpl)({configuration: this.selectorModel.configuration,
                                                                not_hidden_family_id: not_hidden_family_id,
                                                                not_hidden_rental_location_code: not_hidden_rental_location_code,
                                                                promotionCode: this.selectorModel.promotionCode,
                                                                family_id:  (this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.family_id : null),
                                                                rental_location_code: (this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.rental_location_code : null),
                                                                company: commonServices.company
                                                               });
        // Assign to the form
        $(this.selectorModel.form_selector).append(html);
      }

    }

    /**
     *  Setup rental location control
     */ 
    this.setupRentalLocations = function() {

      var self = this;

      // Bind pickup place changed
      $(this.selectorModel.rental_location_code_selector).bind('change', function() {
         self.selectorController.rentalLocationChanged();
      });

    }

    /**
     * Setup simple location
     */ 
    this.setupSimpleLocation = function() {

      if ( $(this.selectorModel.simple_location_selector).length ) {
        console.log('setup Simple location - select2');
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/simple-locations';

        var urlParams = [];
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }  
        if (this.requestLanguage != null) {
          urlParams.push('lang='+this.requestLanguage);
        }

        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }

        var self = this;

        // Setup component
        $(this.selectorModel.simple_location_selector).select2({ width: '100%',
          ajax: {
            url: url,
            processResults: function(data) {
              var transformedData = [];
              for (var idx=0; idx<data.length; idx++) {
                var element = {
                  'text': data[idx].name,
                  'id': data[idx].id
                }
                transformedData.push(element);
              }
              return {results: transformedData};
            },

          }
        });    

        // Select current value (Create and option)
        if (self.selectorModel.shopping_cart && 
            self.selectorModel.shopping_cart.simple_location_id !== null&&
            self.selectorModel.shopping_cart.simple_location_name !== null) {
          var selectedOption = new Option(self.selectorModel.shopping_cart.simple_location_name, 
                                          self.selectorModel.shopping_cart.simple_location_id, 
                                          true, 
                                          true);
          $(this.selectorModel.simple_location_selector).append(selectedOption).trigger('change');
        }

      }

    }

    /**
     * Setup the pickup / return places controls
     */
    this.setupPickupReturnPlace = function() {

      var self = this;

      // Bind pickup place changed
      $(this.selectorModel.pickup_place_selector).on('change', function() {
         self.selectorController.pickupPlaceChanged();
      });

      // Bind return place changed
      $(this.selectorModel.return_place_selector).on('change', function() {
          self.selectorController.returnPlaceChanged();
      });

      // Custom address in pickup/return place
      if (this.selectorModel.configuration.customPickupReturnPlaces) {
        // Google Maps API integration
        if (commonServices.useGoogleMaps) {
          var self = this;
          const loadGoogleMapsApi = require('load-google-maps-api')        
          var opts = {key: commonServices.googleMapsSettings.apiKey, 
                      libraries: ['places']};
          if (commonServices.googleMapsSettings.settings.googleMapsRestrictCountryCode != null) {
            opts['region'] = commonServices.googleMapsSettings.settings.googleMapsRestrictCountryCode;
          } 
          loadGoogleMapsApi(opts).then(function (googleMaps) {
            self.setupAutocomplete(googleMaps);
          }).catch(function (error) {
            console.error(error);
          });
        }
        else {
          $(this.selectorModel.pickup_place_other_selector).bind('blur', function() {
             self.selectorController.customPickupPlaceValueChanged();
          });
        }
        // Close pickup place editor (back to the selector)
        $(this.selectorModel.another_pickup_place_group_close).bind('click', function(){
          self.selectorController.customPickupPlaceCloseBtnClick();
        });
        // Close return place editor (back to the selector)
        $(this.selectorModel.another_return_place_group_close).bind('click', function(){
          self.selectorController.customReturnPlaceCloseBtnClick();
        });
      }

      var returnPlace = new SelectSelector(this.selectorModel.return_place_id, 
                                           new MemoryDataSource([]), 
                                           null, 
                                           true, 
                                           i18next.t('selector.select_return_place'));    

    }

    /**
     * Setup Google Places Autocomplete
     */
    this.setupAutocomplete = function(googleMaps) {

       var self = this;
       var opts = {};
       
       // Restrict country
       if (commonServices.googleMapsSettings.settings.googleMapsRestrictCountryCode != null) {
         opts.componentRestrictions = {country: commonServices.googleMapsSettings.settings.googleMapsRestrictCountryCode};
       }

       // Restrict bounds
       if (commonServices.googleMapsSettings.settings.googlePlacesRetrictBounds) {
          opts.bounds = new google.maps.LatLngBounds({lat: commonServices.googleMapsSettings.settings.googleMapsBoundsSWLat,
                                                      lng: commonServices.googleMapsSettings.settings.googleMapsBoundsSWLng },  // SW
                                                     {lat: commonServices.googleMapsSettings.settings.googleMapsBoundsNELat, 
                                                      lng: commonServices.googleMapsSettings.settings.googleMapsBoundsNELng }); // NE
          opts.strictBounds = true;
       }
       
       // Setup autocomplete - pickup place
       var input = document.getElementById(this.selectorModel.pickup_place_other_id);
       if (input) {
         var autocomplete = new googleMaps.places.Autocomplete(input, opts);      
         autocomplete.addListener('place_changed', function() {
          self.selectorController.customPickupPlaceValueChanged();
         });
       }

       // Setup autocomplete -- return place
       var input = document.getElementById(this.selectorModel.return_place_other_id);
       if (input) {
         var autocomplete = new googleMaps.places.Autocomplete(input, opts);
       }

    }

    /**
     * Setup date controls
     */
    this.setupDateControls = function() {

      var self = this;
      $.datepicker.setDefaults( $.datepicker.regional[this.selectorModel.requestLanguage || 'es'] );
      var locale = $.datepicker.regional[this.selectorModel.requestLanguage || 'es'];
      var maxDate = moment().add(650, 'days').tz(this.selectorModel.configuration.timezone).format(
                      this.selectorModel.configuration.dateFormat);

      // Date From
      $(this.selectorModel.date_from_selector).datepicker({
          numberOfMonths:1,
          maxDate: maxDate,
          dateFormat: 'dd/mm/yy',
          constraintInput: true,
          beforeShow: function(element, instance) {
            console.log('before_show DateFrom');
            if (instance.lastVal) {
              console.log('lastVal:'+instance.lastVal);
              var date = moment(instance.lastVal, self.selectorModel.configuration.dateFormat);
            }
            else {
              var date = moment().tz(self.selectorModel.configuration.timezone);
            }
            self.selectorModel.loadPickupDays(date.year(), date.month()+1);
          },
          beforeShowDay: function(date) {
            var idx = self.selectorModel.pickupDays.findIndex(function(element){
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
            // Only when the calendar is visible to avoid load pickup dates on setup date_from
            if ($(this).datepicker( "widget" ).is(":visible")) {
              console.log('date_from changed month : ' + month+ ' year: '+year);
              // If pickup/return place are allowed, load the days 
              // if the user has selected a pickup place
              if (self.selectorModel.configuration.pickupReturnPlace) {
                if ($(self.selectorModel.pickup_place_selector).val() != null &&
                    $(self.selectorModel.pickup_place_selector).val() != '') { 
                  self.selectorModel.loadPickupDays(year, month);         
                }         
              }   
              else {
                self.selectorModel.loadPickupDays(year, month);
              }      
             }
          },
          onSelect: function(dateText, inst) {
             self.selectorController.dateFromChanged();       
          }

        }, locale);

      // Date To
      $(this.selectorModel.date_to_selector).datepicker({
          numberOfMonths:1,
          maxDate: maxDate,
          dateFormat: 'dd/mm/yy',
          constraintInput: true,
          beforeShow: function(element, instance) {
            console.log('before_show DateTo');
            if (instance.lastVal) {
              console.log('lastVal:'+instance.lastVal);
              var date = moment(instance.lastVal, self.selectorModel.configuration.dateFormat);
              self.selectorModel.loadReturnDays(date.year(), date.month()+1);
            }
            else if (self.selectorModel.dateToMinDate != null) {
              console.log('dateToMin: '+self.selectorModel.dateToMinDate);
              self.selectorModel.loadReturnDays(self.selectorModel.dateToMinDate.year(), self.selectorModel.dateToMinDate.month()+1);
            }
          },
          beforeShowDay: function(date) {
            var idx = self.selectorModel.returnDays.findIndex(function(element){
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
            // Only when the calendar is visible to avoid load pickup dates on setup date_from
            if ($(this).datepicker( "widget" ).is(":visible")) {
              console.log('date_to changed month : ' + month+ ' year: '+year);
              // If pickup/return place are allowed, load the days 
              // if the user has selected a return place
              if (self.selectorModel.configuration.pickupReturnPlace) {
                if ($(self.selectorModel.return_place_selector).val() != null &&
                    $(self.selectorModel.return_place_selector).val() != '') { 
                  self.selectorModel.loadReturnDays(year, month);         
                }         
              }   
              else {
                self.selectorModel.loadReturnDays(year, month);
              }
              if (self.selectorModel.configuration.prefillSelector) {    
                let date_to = $(self.selectorModel.date_to_selector).datepicker('getDate');
                if(date_to !== instance.lastVal){
                  instance.lastVal = date_to;
                }
              } 
            }                
          },
          onSelect: function(dateText, inst) {
             self.selectorController.dateToChanged();
          },
          onClose: function(dateText, inst) {
             console.log('on close date_to');
          }    
        }, locale);

      // Avoid Google Automatic Translation
      $('.ui-datepicker').addClass('notranslate');

      // Configure event change Date From
      $(this.selectorModel.date_from_selector).on('change', function() {
        // When it has a value
        if ( $(self.selectorModel.date_from_selector).datepicker('getDate') !== null ) {
           self.selectorController.dateFromChanged();
        }
      });

    }

    /**
     * Setup the date_from min value
     * -----------------------------
     *
     * Get the max value between the date_from calendar first day and 
     * the selected date from + min days
     * 
     */ 
    this.setupDateToMinValue = function() {

      // DateFrom
      var dateFrom = $(this.selectorModel.date_from_selector).datepicker('getDate');

      // Calculate dateTo from dateFrom
      var dateTo = null;
      if (this.selectorModel.configuration.cycleOf24Hours) {
        var dateTo = moment(dateFrom).add(this.selectorModel.configuration.minDays, 'days');
      }
      else {
        var dateTo = moment(dateFrom).add(this.selectorModel.configuration.minDays - 1, 'days');
      } 
      
      this.selectorModel.dateToMinDate = dateTo;

      // Configure date_to minDate
      $(this.selectorModel.date_to_selector).datepicker('option', 'minDate', 
              dateTo.tz(this.selectorModel.configuration.timezone).format(this.selectorModel.configuration.dateFormat));

    },

    /**
     * Setup validation
     */
    this.setupValidation = function() {

        var self = this;

        $.validator.addMethod('same_day_time_from', function(value, element) {
          if (self.selectorModel.configuration.timeToFrom) {
            if ($(self.selectorModel.date_from_selector).val() == $(self.selectorModel.date_to_selector).val()) {
              return $(self.selectorModel.time_to_selector).val() > $(self.selectorModel.time_from_selector).val();
            }
            return true;
          }
          return true;
        });

        var promotionCodeUrl = commonServices.URL_PREFIX + '/api/check-promotion-code';
        var urlParams = [];
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }    
        if (urlParams.length > 0) {
          promotionCodeUrl += '?';
          promotionCodeUrl += urlParams.join('&');
        }

        $.validator.addMethod("ageAllowed", function(value, element) {
          var isVisible = self.selectorModel.driver_age_rule_selector + ':visible';

          if (!isVisible) {
            return true;
          }

          if (!value) {
            return false;
          }

          var isAllowed = $(element).find('option[value=' + value + ']').attr('allowed') === 'true';

          return isAllowed;
       });

        $(this.selectorModel.form_selector).validate({
           submitHandler: function(form) {
            // console.log($(form).formParams());
            return true;
           } ,
           invalidHandler: function(form)
           {
             $(self.selectorModel.form_selector + ' label.form-reservation-error').remove();
           },
           rules: {
               rental_location_code: {
                   required: self.selectorModel.rental_location_code_selector + ':visible'
               },
               driver_age_rule_id: {
                required: self.selectorModel.driver_age_rule_selector + ':visible',
                ageAllowed: true,
              },
               pickup_place: {
                   required: self.selectorModel.pickup_place_selector + ':visible'
               },
               pickup_place_other: {
                   required: self.selectorModel.pickup_place_other_selector + ':visible'
               },
               return_place: {
                   required: self.selectorModel.return_place_selector + ':visible'
               },
               return_place_other: {
                   required: self.selectorModel.return_place_other_selector + ':visible'
               },   
               date_from: {
                   required: self.selectorModel.date_from_selector + ':visible'
               },
               time_from: {
                   required: self.selectorModel.configuration.timeToFrom
               },
               date_to: {
                   required: self.selectorModel.date_to_selector + ':visible' 
               },
               time_to: {
                   required: self.selectorModel.configuration.timeToFrom,
                   same_day_time_from: true
               },
               renting_duration: {
                   required: self.selectorModel.configuration.rentDateSelector === 'date_from_duration'
               },
               promotion_code: {
                   remote: {
                       url: promotionCodeUrl,
                       type: 'POST',
                       data: {
                           code: function() {
                               return $(self.selectorModel.promotion_code_selector).val();
                           },
                           from: function() {
                               return moment($(self.selectorModel.date_from_selector).datepicker('getDate')).format('YYYY-MM-DD'); 
                           },
                           to: function() {
                               return moment($(self.selectorModel.date_to_selector).datepicker('getDate')).format('YYYY-MM-DD'); 
                           }
                       }
                   }
               },
               accept_age: {
                   required: self.selectorModel.accept_age_selector+':visible'
               }               
           },
           messages: {
               rental_location_code: {
                   required: i18next.t('common.required')
               },
               driver_age_rule_id: {
                required: i18next.t('common.required'),
                ageAllowed:  function (showMessage, element) {
                  if (showMessage) {
                    var value = $(element).val();
                  
                    return $(element).find('option[value=' + value + ']').attr('message_not_allowed');
                  }
                }
              },
               pickup_place: {
                   required: i18next.t('selector.validations.pickupPlaceRequired')
               },
               pickup_place_other: {
                   required: i18next.t('selector.validations.pickupPlaceRequired')
               },
               return_place: {
                   required: i18next.t('selector.validations.returnPlaceRequired')
               }, 
               return_place_other: {
                   required: i18next.t('selector.validations.returnPlaceRequired')
               },  
               date_from: {
                   required: i18next.t('selector.validations.dateFromRequired')
               },
               time_from: {
                   required: i18next.t('selector.validations.timeFromRequired')
               },
               date_to: {
                   required: i18next.t('selector.validations.dateToRequired')
               },  
               time_to: {
                   required:i18next.t('selector.validations.timeToRequired'),
                   same_day_time_from: i18next.t('selector.validations.sameDayTimeToGreaterTimeFrom')
               },
               renting_duration: {
                   required: i18next.t('common.required')
               },               
               promotion_code: {
                   remote: i18next.t('selector.validations.promotionCodeInvalid')
               },
               accept_age: {
                   required: i18next.t('selector.validations.acceptAge', {years: 21})
               }
           },
           errorPlacement: function (error, element) {

            // error.insertAfter(element.parent());
            error.insertAfter(element);

           },
           errorClass : 'form-reservation-error'
        });

    }

    /**
     * Setup Time controls
     */
    this.setupTimeToFrom = function() {

        var pickupTime = new SelectSelector(this.selectorModel.time_from_id, 
                                            new MemoryDataSource([]), 
                                            null, 
                                            true, 
                                            'hh:mm');     

        var returnTime = new SelectSelector(this.selectorModel.time_to_id, 
                                            new MemoryDataSource([]), 
                                            null, 
                                            true, 
                                            'hh:mm');  

        var self = this;
        // If manage durations when time from changed load durations
        if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
          $(this.selectorModel.time_from_selector).on('change', function(){
            self.selectorController.timeFromChanged();
          });
        }        

    }

    // ------------------------ Load data -------------------------------------

    /**
     *  Setup rental locations
     */ 
    this.loadRentalLocations = function() {

      this.selectorModel.loadRentalLocations();

    }

    /**
     * Setup the families
     */
    this.loadFamilies = function() {

      this.selectorModel.loadFamilies();

    }

    /**
     * Setup the age rules
     */
    this.loadAgeRules = function() {

      this.selectorModel.loadAgeRules();

    }

    /*
     * Load pickup hours
     */
    this.loadPickupHours = function() { /** Load return dates **/
      var date = moment($(this.selectorModel.date_from_selector).datepicker('getDate')).format('YYYY-MM-DD');  
      this.selectorModel.loadPickupHours(date);
    }

    /**
     * Load return hours
     */
    this.loadReturnHours = function() {
      var date = moment($(this.selectorModel.date_to_selector).datepicker('getDate')).format('YYYY-MM-DD');  
      this.selectorModel.loadReturnHours(date);
    }

    /**
     * Load durations
     */ 
     this.loadDurations = function() {
       var date = moment($(this.selectorModel.date_from_selector).datepicker('getDate')).format('YYYY-MM-DD'); 
       this.selectorModel.loadDurations(date);
     }

    /**
     * Load pickup places
     */
    this.loadPickupPlaces = function() {

        var self = this;

        console.log('load pickup places');

        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/pickup-places';
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
        this.selectorModel.dataSourcePickupPlaces = new RemoteDataSource(url,
                                                          {'id':'id',
                                                           'description':function(data) {
                                                               var value = data.name;
                                                               if (data.price && data.price > 0) {
                                                                   value += ' - ';
                                                                   value += 
                                                                       self.selectorModel.configuration.formatCurrency(data.price,
                                                                                                                       self.selectorModel.configuration.currencySymbol,
                                                                                                                       self.selectorModel.configuration.currencyDecimals,
                                                                                                                       self.selectorModel.configuration.currencyThousandsSeparator,
                                                                                                                       self.selectorModel.configuration.currencyDecimalsMark,
                                                                                                                       self.selectorModel.configuration.currencySymbolPosition);
                                                                   value += '';
                                                               }
                                                               return value;
                                                           }});

        var pickupPlace = new SelectSelector(this.selectorModel.pickup_place_id, 
                                             this.selectorModel.dataSourcePickupPlaces, 
                                             null, 
                                             true, 
                                             i18next.t('selector.select_pickup_place'),
                function() { // Callback that is executed when data is loaded
                  // Custom places -> Add new option
                  if (self.selectorModel.configuration.customPickupReturnPlaces) {
                      if (self.selectorModel.configuration.customPickupReturnPlacePrice && 
                          self.selectorModel.configuration.customPickupReturnPlacePrice != '' && 
                          self.selectorModel.configuration.customPickupReturnPlacePrice > 0) {
                          $(self.selectorModel.pickup_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place') + ' - ' +
                                    self.selectorModel.configuration.formatCurrency(self.selectorModel.configuration.customPickupReturnPlacePrice,
                                                                                    self.selectorModel.configuration.currencySymbol,
                                                                                    self.selectorModel.configuration.currencyDecimals,
                                                                                    self.selectorModel.configuration.currencyThousandsSeparator,
                                                                                    self.selectorModel.configuration.currencyDecimalsMark,
                                                                                    self.selectorModel.configuration.currencySymbolPosition) + ''
                          }));
                      }
                      else {
                          $(self.selectorModel.pickup_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place')
                          }));
                      }
                  }
                
                  // Init - Assign the pickup place if selected
                  if (self.selectorModel.shopping_cart) {
                    // Custom pickup place
                    if (self.selectorModel.shopping_cart.custom_pickup_place) { 
                        $(self.selectorModel.pickup_place_selector).val('other');
                        $(self.selectorModel.pickup_place_other_selector).val(self.selectorModel.shopping_cart.pickup_place);
                        $(self.selectorModel.custom_pickup_place_selector).val('true');
                        $(self.selectorModel.another_pickup_place_group_selector).show();
                        $(self.selectorModel.pickup_place_group_selector).hide();
                    }
                    else { // Pickup place from the list
                        var pickup_place = self.selectorModel.shopping_cart.pickup_place ? self.selectorModel.shopping_cart.pickup_place.replace(/\+/g, ' ') : self.selectorModel.shopping_cart.pickup_place;
                        $(self.selectorModel.pickup_place_selector).val(pickup_place);
                    }
                    // Assign the delivery date
                    if (self.selectorModel.shopping_cart.date_from) {
                      var date_from = moment(self.selectorModel.shopping_cart.date_from).format(self.selectorModel.configuration.dateFormat); 
                      $(self.selectorModel.date_from_selector).datepicker('setDate', date_from); 
                      if (self.selectorModel.configuration.timeToFrom) {
                        self.loadPickupHours();
                      }
                      // Load durations
                      if (self.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
                        self.loadDurations();
                      }
                    }
                    self.loadReturnPlaces(false); // date_to is assigned after return_place assignation
                  }
                  else {
                    // Prefill selector => Assign the first pickup place
                    if (self.selectorModel.configuration.prefillSelector) {
                      var firstOption = $(self.selectorModel.pickup_place_selector+" option:eq(1)").val();
                      // Select first pickup place
                      if (firstOption !== '') {
                        $(self.selectorModel.pickup_place_selector).val(firstOption);
                        $(self.selectorModel.pickup_place_selector).trigger('change');
                      }
                    }
                  }
                  // End - Assign the pickup place

                  // When not prefill selector => Update the pickup place (to avoid clear date_to)
                  if (!self.selectorModel.configuration.prefillSelector) {
                    self.update('place', 'pickup_place');
                  }

                });
        
    }

    /**
     * Load return places
     */  
    this.loadReturnPlaces = function(assignPickupPlace) {

        var self = this;

        console.log('load return places');

        // Do not load the return places while pickup place is not setup
        if (this.selectorModel.shopping_cart == null && 
            ($(this.selectorModel.pickup_place_selector).val() == '')) {
          return;
        }
        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/return-places';
        var urlParams = [];
        urlParams.push('pickup_place='+encodeURIComponent($(this.selectorModel.pickup_place_selector).val()));
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
        // Datasource
        this.selectorModel.dataSourceReturnPlaces = new RemoteDataSource(url,
                                                          {'id':'id',
                                                           'description':function(data) {
                                                               var value = data.name;
                                                               if (data.price && data.price > 0) {
                                                                   value += ' - ';
                                                                   value += 
                                                                       self.selectorModel.configuration.formatCurrency(data.price,
                                                                       self.selectorModel.configuration.currencySymbol,
                                                                       self.selectorModel.configuration.currencyDecimals,
                                                                       self.selectorModel.configuration.currencyThousandsSeparator,
                                                                       self.selectorModel.configuration.currencyDecimalsMark,
                                                                       self.selectorModel.configuration.currencySymbolPosition);
                                                                   value += '';
                                                               }
                                                               return value;
                                                           }});


        var returnPlace = new SelectSelector(this.selectorModel.return_place_id, 
                                             this.selectorModel.dataSourceReturnPlaces, 
                                             null, true, 
                                             i18next.t('selector.select_return_place'),
                function() { // Callback that is executed when data is loaded 
                  // Add other place option to the pickup places if the configuration accept custom places
                  if (self.selectorModel.configuration.customPickupReturnPlaces) {
                      if (self.selectorModel.configuration.customPickupReturnPlacePrice && 
                          self.selectorModel.configuration.customPickupReturnPlacePrice != '' && 
                          self.selectorModel.configuration.customPickupReturnPlacePrice > 0) {
                          $(self.selectorModel.return_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place') + ' - ' +
                                    self.selectorModel.configuration.formatCurrency(self.selectorModel.configuration.customPickupReturnPlacePrice,
                                                                                    self.selectorModel.configuration.currencySymbol,
                                                                                    self.selectorModel.configuration.currencyDecimals,
                                                                                    self.selectorModel.configuration.currencyThousandsSeparator,
                                                                                    self.selectorModel.configuration.currencyDecimalsMark,
                                                                                    self.selectorModel.configuration.currencySymbolPosition) + ''
                          }));
                      }
                      else {
                          $(self.selectorModel.return_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place')
                          }));
                      }
                  }

                  // Init - Assign the return place if selected
                  if (self.selectorModel.shopping_cart && 
                      self.selectorModel.shopping_cart.return_place != null) {
                    if (self.selectorModel.shopping_cart.custom_return_place) { // Custom return place
                        $(self.selectorModel.return_place_selector).val('other');
                        $(self.selectorModel.return_place_other_selector).val(self.selectorModel.shopping_cart.return_place);
                        $(self.selectorModel.custom_return_place_selector).val('true');
                        $(self.selectorModel.another_return_place_group_selector).show();
                        $(self.selectorModel.return_place_group_selector).hide();
                    }
                    else { // Return place
                        var return_place = self.selectorModel.shopping_cart.return_place ? self.selectorModel.shopping_cart.return_place.replace(/\+/g, ' ') : self.selectorModel.shopping_cart.return_place;
                        $(self.selectorModel.return_place_selector).val(return_place);
                    }
                    // Assign the collection date
                    if (self.selectorModel.shopping_cart.date_to) {
                      var date_to = moment(self.selectorModel.shopping_cart.date_to).format(self.selectorModel.configuration.dateFormat); 
                      $(self.selectorModel.date_to_selector).datepicker('setDate', date_to); 
                      if (self.selectorModel.configuration.timeToFrom) {
                        self.loadReturnHours();
                      } 
                    }
                  }
                  else { // Assign the pickup place to the return place
                    if (assignPickupPlace) {
                      if ($(self.selectorModel.pickup_place_selector).val() == 'other') {
                        self.selectorController.customPickupPlaceValueChanged();
                      }
                      else {
                        $(self.selectorModel.return_place_selector).val($(self.selectorModel.pickup_place_selector).val());
                        $(self.selectorModel.return_place_other_selector).val('');
                      }
                      // In both cases notify that the return place has changed
                      self.selectorController.returnPlaceChanged();
                    }
                  }
                  // End - Assign the return place if selected   

                  // When not prefill selector => Update the return place (to avoid clear date_to)
                  if (!self.selectorModel.configuration.prefillSelector) {
                    self.update('place', 'return_place');
                  }

                } );

    }

    // ------------------------ Update GUI ------------------------------------

    /**
     * Update the GUI when selector fields changes
     */
    this.update = function(action, id) {

      var self = this;

      switch (action) {
        case 'families':
          if ($(this.selectorModel.family_id_selector).length > 0 && this.selectorModel.families.length > 0) {
            var dataSource = new MemoryDataSource(this.selectorModel.families);
            var family_id = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.family_id : null;
            var familyId = new SelectSelector(this.selectorModel.family_id,
                                              dataSource, 
                                              family_id, 
                                              true,
                                              i18next.t('selector.select'));
            $(this.selectorModel.family_selector).show();
          }
          break;
        case 'rentalLocations':
          if ($(this.selectorModel.rental_location_code_selector).length > 0 && this.selectorModel.rentalLocations.length > 0) {
            var dataSource = new MemoryDataSource(this.selectorModel.rentalLocations);
            var rental_location_code = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.rental_location_code : null;
            console.log('rental_location_code');
            console.log(this.selectorModel.shopping_cart);
            console.log(rental_location_code);
            var rentalLocationCode = new SelectSelector(this.selectorModel.rental_location_code,
                                                        dataSource, 
                                                        rental_location_code, 
                                                        true,
                                                        i18next.t('selector.select'));
            $(this.selectorModel.rental_location_selector).show();
          }          
          break; 
        case 'driverAgeRules':
          if ($(this.selectorModel.driver_age_rule_selector).length > 0 && this.selectorModel.driverAgeRules.length > 0) {
            var dataSource = new MemoryDataSource(this.selectorModel.driverAgeRules);
            var driver_age_rule_id  = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.driver_age_rule_id : null;
            new SelectSelector(this.selectorModel.driver_age_rule_id,
                                              dataSource, 
                                              driver_age_rule_id, 
                                              true,
                                              i18next.t('selector.select'));

            $(this.selectorModel.driver_age_rule_selector).show();
          }
          break;
        case 'place':
          if (id== 'pickup_place') {
            // Enable return place selector
            if ($(this.selectorModel.pickup_place_selector).attr('disabled')) {
              $(this.selectorModel.pickup_place_selector).attr('disabled', false);
            }    
            // Force Load pickup days
            if (this.selectorModel.configuration.prefillSelector) {
              var date = moment().tz(this.selectorModel.configuration.timezone);
              this.selectorModel.loadPickupDays(date.year(), date.month()+1);
            }

          }
          else if (id == 'return_place') {
            // Enable return place selector
            if ($(this.selectorModel.return_place_selector).attr('disabled')) {
              $(this.selectorModel.return_place_selector).attr('disabled', false);
            }    
            // Force Load return days
            if (this.selectorModel.configuration.prefillSelector) {
              var dateFrom = $(this.selectorModel.date_from_selector).datepicker('getDate');
              if (dateFrom) {
                var date = moment(dateFrom).add(this.selectorModel.configuration.selectorDateToDays, 'day');
                this.selectorModel.loadReturnDays(date.year(), date.month()+1);
              }
            }
          }
          break;
        case 'days':
          if (id == 'date_from') {
            $(this.selectorModel.date_from_selector).datepicker('refresh');
            // Enable the control
            if ($(this.selectorModel.date_from_selector).attr('disabled')) {  
              $(this.selectorModel.date_from_selector).attr('disabled', false);
            }    
            // Prefill selector
            if (this.selectorModel.configuration.prefillSelector) {     
              if (!$(this.selectorModel.date_from_selector).datepicker( "widget" ).is(":visible")) {
                // Setup the first available date in calendar (just after loadPickupDays)
                if (this.selectorModel.pickupDays && this.selectorModel.pickupDays.length > 0) {
                  var firstAvailableDate = this.selectorModel.pickupDays[0];
                  if (firstAvailableDate) {
                    var firstDateValue = moment(firstAvailableDate).format(this.selectorModel.configuration.dateFormat);
                    $(this.selectorModel.date_from_selector).datepicker('setDate', firstDateValue);
                    $(this.selectorModel.date_from_selector).trigger('change');
                  }  
                }
                console.log('pickup days loaded');

                // If not pickup/return places => Load return days
                if (!this.selectorModel.configuration.pickupReturnPlace) {
                  var dateFrom = $(this.selectorModel.date_from_selector).datepicker('getDate');
                  if (dateFrom) {
                    var date = moment(dateFrom).add(this.selectorModel.configuration.selectorDateToDays, 'day');
                    this.selectorModel.loadReturnDays(date.year(), date.month()+1);
                  }
                }

              }            
            }   
          }
          else if (id == 'date_to') {
            $(this.selectorModel.date_to_selector).datepicker('refresh');
            console.log('update date_to');
            // Prefill selector
            if (this.selectorModel.configuration.prefillSelector) {     
              // Setup the first available date in calendar (just after loadReturnDays)
              if (this.selectorModel.returnDays && this.selectorModel.returnDays.length > 0) {
                var dateFrom = $(this.selectorModel.date_from_selector).datepicker('getDate');
                if (dateFrom) {
                  var candidateDateTo = moment(dateFrom).add(this.selectorModel.configuration.selectorDateToDays, 'day');
                  var candidateDateToFormatted = moment(candidateDateTo).format('YYYY-MM-DD');
                  var selectedValues = this.selectorModel.returnDays.filter(function(value){
                    return value >= candidateDateToFormatted;
                  });
                  if (selectedValues.length > 0) {
                    var selectedValue = selectedValues[0];
                    var formattedValue = moment(selectedValue).format(this.selectorModel.configuration.dateFormat);
                    $(this.selectorModel.date_to_selector).datepicker('setDate', formattedValue);
                    $(this.selectorModel.date_to_selector).trigger('change');  
                    this.selectorController.dateToChanged();
                  }
                }               
              }
              console.log('return days loaded');  
            }
          }
          break;
        case 'hours':
          if (id == 'time_from') {
            console.log('update time_from');
            var dataSource = new MemoryDataSource(this.selectorModel.pickupHours);
            var timeFrom = null;
            if (this.selectorModel.shopping_cart && this.selectorModel.shopping_cart.time_from) {
              timeFrom = this.selectorModel.shopping_cart.time_from;
            }
            else {
              if (this.selectorModel.configuration.prefillSelector) {
                timeFrom = this.selectorModel.configuration.defaultTimeStart;
              }
              else {
                timeFrom = null;
              }
            }
            if (timeFrom != null && this.selectorModel.pickupHours.indexOf(timeFrom) == -1) {
              if (this.selectorModel.pickupHours.length > 0) {
                timeFrom = this.selectorModel.pickupHours[0];
              }
              else {
                timeFrom = null;
              }
            }            
            var pickupTime = new SelectSelector(this.selectorModel.time_from_id,
                                                dataSource, 
                                                timeFrom, 
                                                true, 
                                                'hh:mm',
                                                function() {
                                                    // After load data => Select current value
                                                    if (timeFrom != null) {
                                                      $(self.selectorModel.time_from_selector).val(timeFrom);
                                                    }
                                                } );
            // Enable the control
            if ($(this.selectorModel.time_from_selector).attr('disabled')) {   
              $(this.selectorModel.time_from_selector).attr('disabled', false);
            } 

            if (this.selectorModel.configuration.rentDateSelector === 'date_from_duration') {
              // Load durations in base date_from
              this.loadDurations(); 
              if ($(this.selectorModel.duration_selector).attr('disabled')) {   
                // Enable duration control if disabled
                $(this.selectorModel.duration_selector).attr('disabled', false);
              }
            }

          }
          else if (id == 'time_to') {
            console.log('update time_to');
            var dataSource = new MemoryDataSource(this.selectorModel.returnHours);

            var timeTo = null;
            if (this.selectorModel.shopping_cart && this.selectorModel.shopping_cart.time_to) {
              timeTo = this.selectorModel.shopping_cart.time_to;
            }
            else {
              if (this.selectorModel.configuration.prefillSelector) {
                timeTo = this.selectorModel.configuration.defaultTimeEnd;
              }
              else {
                timeTo = null;
              }
            }
            if (timeTo != null && this.selectorModel.returnHours.indexOf(timeTo) == -1) {
              if (this.selectorModel.returnHours.length > 0) {
                timeTo = this.selectorModel.returnHours[0];
              }
              else {
                timeTo = null;
              }
            }
            var pickupTime = new SelectSelector(this.selectorModel.time_to_id,
                                                dataSource, 
                                                timeTo, 
                                                true, 
                                                'hh:mm',
                                                function() {
                                                    // After load data => Select current value
                                                    if (timeTo != null) {
                                                      $(self.selectorModel.time_to_selector).val(timeTo);
                                                    }
                                                } );
            // Enable the control
            if ($(this.selectorModel.time_to_selector).attr('disabled')) {   
              $(this.selectorModel.time_to_selector).attr('disabled', false);
            }            
          }
          break;
        case 'durations':
          var dataSource = new MemoryDataSource(this.selectorModel.durations, {'id': 'value', 'description': 'text'});
          var renting_duration = this.selectorModel.shopping_cart ? this.selectorModel.shopping_cart.renting_duration : null;
          console.log('renting_duration');
          console.log(this.selectorModel.shopping_cart);
          console.log(renting_duration);
          var durationId = new SelectSelector(this.selectorModel.duration_id,
                                            dataSource, 
                                            renting_duration, 
                                            false);
          // Enable the control
          if ($(this.selectorModel.duration_selector).attr('disabled')) {   
            $(this.selectorModel.duration_selector).attr('disabled', false);
          }           
          break;          
      }

    }


  };

  var SelectorRent = function() {
    this.model = new SelectorRentModel();
    this.controller = new SelectorRentController();
    this.view = new SelectorRentView(this.model, this.controller);

    this.controller.setSelectorView(this.view);
    this.controller.setSelectorModel(this.model);
    this.model.setSelectorView(this.view);

  }

  return SelectorRent;


});
