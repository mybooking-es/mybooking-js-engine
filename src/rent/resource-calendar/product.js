define('selector', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings', 'commonTranslations', 'commonLoader','commonUI',
         './../mediator/rentEngineMediator',
         'i18next', 'moment', 'ysdtemplate', './ProductCalendar',
         'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,
                  commonServices, commonSettings, commonTranslations, commonLoader, commonUI, rentEngineMediator,
                  i18next, moment, tmpl, ProductCalendar) {

  /***************************************************************************
   *
   * Selector Model
   *
   ***************************************************************************/
  var productModel = {

    requestLanguage: null, // Request language
    configuration: null, // The platform configuration

    today: null,       // Today (to manage the calendar)
    minTimeFrom: null, // Min time from
    maxTimeFrom: null, // Max time to
    code: null, // Product code
    salesChannelCode: null, // Sales channel code
    rentalLocationCode: null, // Rental location code
    checkHourlyOccupation: false, // Check hourly occupation
    pickupPlace: null, // Selected pickup/place
    selectedDateFrom: null, // Selected date from
    selectedDateTo: null, // Selected date to
    shoppingCartId: null, // The shoppingCart Id

    availabilityData: null, // Availability data
    pickupHours: [],  // Available pickup hours
    returnHours: [],  // Available return hours
    turns: [],       // Available turns
    showHoursTurns: false, // ShowHoursTurns

    dataSourcePickupPlaces: null, // Pickup places datasource
    dataSourceReturnPlaces: null, // Return places datasource

    shopping_cart: null, // The shopping cart
    product_available: null, // The selected product availability
    product_type: null, // The product type
    product: null, // The product detailed information

    // ------------------ Selectors -------------------------------------------

    // form selector
    form_selector: 'form[name=search_form]',
    form_selector_tmpl: 'form_calendar_selector_tmpl',
    // == Pickup / Return place selector
    // pickup place   
    pickup_place_id: 'pickup_place',
    pickup_place_selector: '#pickup_place',
    pickup_place_other_selector: '#pickup_place_other',
    pickup_place_group_selector: '.pickup_place_group',    
    custom_pickup_place_selector: 'input[name=custom_pickup_place]',
    another_pickup_place_group_selector: '#another_pickup_place_group',
    // return place
    return_place_id: 'return_place',
    return_place_selector: '#return_place',
    return_place_other_selector: '#pickup_place_other',
    return_place_container_selector: '.return_place',
    return_place_group_selector: '.return_place_group',   
    custom_return_place_selector: 'input[name=custom_pickup_place]',
    another_return_place_group_selector: '#another_pickup_place_group',
    // == Date selector
    productCalendar: null,
    date_selector: '#date',
    duration_scope_selector: 'form[name=search_form] input[name=duration_scope]',
    // Do not use the selector directly => Use productView.getDurationScopeVal
    duration_scope_selector_val: 'form[name=search_form] input[name=duration_scope]:checked', 
    // == Time From / To selector
    // time from
    time_from_id: 'time_from',
    time_from_selector: '#time_from',
    // time to
    time_to_id: 'time_to',        
    time_to_selector: '#time_to',  
    // turn
    turn_selector: 'form[name=search_form] input[name=turn]',
    turn_selector_hidden: 'form[name=search_form] input[type=hidden][name=turn]',
    turn_selector_val: 'form[name=search_form] input[name=turn]:checked',
    // == Other fields
    // promotion code    
    promotion_code_selector: '#promotion_code',
    // driver age
    driver_age_rule_selector: '#driver_age_rule',
    // number of products
    number_of_products_selector: '#number_of_products',
    // accept age
    accept_age_selector: '#accept_age',
    
    // add to shopping cart button
    add_to_shopping_cart_btn_selector: '#add_to_shopping_cart_btn',

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        productModel.configuration = data;
        productView.init();
      }, 'rent', this.code );
    },   

    // -------------- Check availability -----------------------

    /**
     * Check product availability
     */
    checkAvailability: function(dateFrom, dateTo) {

      var url = commonServices.URL_PREFIX + '/api/booking/frontend/products/' + this.code + '/occupation';
      url += '?from='+dateFrom+'&to='+dateTo;      
      if (this.pickupPlace) {
        url += '&pickup_place='+encodeURIComponent(this.pickupPlace);
      }
      if (this.rentalLocationCode) {
        url += '&rental_location_code='+encodeURIComponent(this.rentalLocationCode);
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }    
      if (productModel.salesChannelCode && productModel.salesChannelCode != '') {
        url += '&sales_channel_code='+productModel.salesChannelCode;
      }
      url += '&duration_scope='+productView.getDurationScopeVal();

      // Get the firstday
      url += "&firstday=true";      

      $.ajax({
        type: 'GET',
        url : url,
        contentType : 'application/json; charset=utf-8',
        success: function(data, textStatus, jqXHR) {
            // Hold the availability data
            productModel.availabilityData = data;
            // Update the calendar
            productModel.productCalendar.view.update(productModel.availabilityData);
        },
        error: function(data, textStatus, jqXHR) {
            alert(i18next.t('selector.error_loading_data'));
        },
        beforeSend: function(jqXHR) {
          commonLoader.show();
        },
        complete: function(jqXHR, textStatus) {
            commonLoader.hide();
        }
      });

    },

    /**
     * Check day occupation
     */ 
    checkDayOccupation: function(date) { 

      var url = commonServices.URL_PREFIX + '/api/booking/frontend/products/' + this.code + '/daily-occupation';
      url += '?date='+date;      
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }  

      $.ajax({
        type: 'GET',
        url : url,
        contentType : 'application/json; charset=utf-8',
        success: function(data, textStatus, jqXHR) {      
          if (data && data.occupation) {
            if (document.getElementById('script_daily_occupation')) {
              console.log('format::'+productModel.configuration.dateFormat);
              var result = tmpl('script_daily_occupation')({data: data.occupation, 
                                                            moment: moment, 
                                                            timezone: productModel.configuration.timezone,
                                                            format: productModel.configuration.dateFormat});
              if ($('#modalDailyOccupation_MBM').length) {
                $('#modalDailyOccupation_MBM .modal-product-detail-title').html(i18next.t('calendar_selector.busy'));
                $('#modalDailyOccupation_MBM .modal-product-detail-content').html(result);      
              }
              else {
                $('#modalDailyOccupation_MBM .modal-product-detail-title').html(i18next.t('calendar_selector.busy'));
                $('#modalDailyOccupation .modal-product-detail-content').html(result);                 
              }
              commonUI.showModal('#modalDailyOccupation');
            }
          }
        }

      });

    },

    /**
     * Access the API to get the available pickup hours in a date
     */
    loadPickupHours: function(id, date) { /* Load pickup hours */
      var self=this;
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date+'&action=deliveries';
      if (this.configuration.pickupReturnPlace && $(this.pickup_place_selector).val() != '') {
        url += '&place='+$(this.pickup_place_selector).val();
      }
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      }       
      if (typeof this.code !== 'undefined' && this.code !== null && this.code !== '') {
        url += '&product='+this.code;
      }
      // Request             
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.pickupHours = data;
          productView.update('hours', id);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    },

    /**
     * Access the API to get the available return hours in a date
     */
    loadReturnHours: function(id, date) { /* Load return hours */
      var self=this;
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/times?date='+date+'&action=collections';
      if (this.configuration.pickupReturnPlace && $(this.return_place_selector).val() != '') {
        url += '&place='+$(this.return_place_selector).val();
      }        
      if (commonServices.apiKey && commonServices.apiKey != '') {
        url += '&api_key='+commonServices.apiKey;
      } 
      if (typeof this.code !== 'undefined' && this.code !== null && this.code !== '') {
        url += '&product='+this.code;
      }   
      // Request                  
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.returnHours = data;
          productView.update('hours', id);
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });
    },

    /**
     * Access the API to get the available turns
     */ 
    loadTurns: function(date) { /* Load turns */
    
      var self=this;
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/products/'+this.code+'/turns?date='+date;  
      if (this.configuration.pickupReturnPlace && $(this.return_place_selector).val() != '') {
        url += '&place='+$(this.return_place_selector).val();
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
          self.turns = data;
          productView.update('turns');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        }
      });

    },

    /* ---------------- Calculate price and ShoppingCart management -------- */

    /**
     * Calculate price (build the shopping cart and choose the product)
     */
    calculatePriceAvailability: function() {

      var dataRequest = this.buildDataRequest();
      var dataRequestJSON =  encodeURIComponent(JSON.stringify(dataRequest));
      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/shopping-cart';
      if (this.shoppingCartId == null) {
        this.shoppingCartId = this.getShoppingCartFreeAccessId();
      }
      if (this.shoppingCartId) {
        url+= '/'+this.shoppingCartId;
      }
      var urlParams = [];
      urlParams.push('include_products=true');
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
      var self = this;
      commonLoader.show();
      $.ajax({
        type: 'POST',
        url: url,
        data: dataRequestJSON,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        crossDomain: true,
        success: function(data, textStatus, jqXHR) {
          if (self.shoppingCartId == null || self.shoppingCartId != data.shopping_cart.free_access_id) {
            self.shoppingCartId = data.shopping_cart.free_access_id;
            self.putShoppingCartFreeAccessId(self.shoppingCartId);
          }
          self.shopping_cart = data.shopping_cart;
          self.product_available = data.product_available;
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            self.product = data.products[0];
          }
          else {
            self.product = null;
          }
          productView.update('shopping_cart');
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('selector.error_loading_data'));
        },
        beforeSend: function(jqXHR) {
          commonLoader.show();
        },        
        complete: function(jqXHR, textStatus) {
          commonLoader.hide();
        }
      });

    },

    /**
     * Get the shopping cart from the session storage
     */ 
    getShoppingCartFreeAccessId: function() {
      return sessionStorage.getItem('shopping_cart_free_access_id');
    },

    /**
     * Store shopping cart free access ID in season
     */
    putShoppingCartFreeAccessId: function(value) {
      sessionStorage.setItem('shopping_cart_free_access_id', value);
    },

    /**
     * Build data request
     * (TODO Custom pickup/return place)
     */
    buildDataRequest: function() {

      var data = {date_from: moment(this.selectedDateFrom).format('DD/MM/YYYY'),
                  date_to: moment(this.selectedDateTo).format('DD/MM/YYYY'),
                  category_code: this.code,
                  engine_fixed_product: true
                  };

      if (this.salesChannelCode != null) {
        data.sales_channel_code = this.salesChannelCode;
      }
      if (this.rentalLocationCode != null) {
        data.rental_location_code = this.rentalLocationCode;
        data.engine_fixed_rental_location = ($(this.form_selector).find('input[type=hidden][name=rental_location_code]').length == 0);
      }

      if (this.configuration.pickupReturnPlace) {
        data.pickup_place = $(this.pickup_place_selector).val();
        data.return_place = $(this.return_place_selector).val();
      }

      // If uses times
      if (this.configuration.timeToFrom || this.configuration.timeToFromInOneDay) {

        if (this.showHoursTurns) { // Only if hours or turns are being shown

          if (this.configuration.rentTimesSelector === 'hours') { 
            // Hours
            data.time_from = $(this.time_from_selector).val();
            data.time_to = $(this.time_to_selector).val();
          }
          else if (this.configuration.rentTimesSelector === 'time_range') {
            var timeRange = null;
            if ($(this.turn_selector_hidden).length) {
              // Hidden with one value
              var timeRange = $(this.turn_selector_hidden).val();
            }
            else {
              // Radio with multiple values
              var timeRange = $(this.turn_selector_val).val();
            }
            if (timeRange != null && timeRange != '') {
              var times = timeRange.split('-');
              if (times.length == 2) {
                data.time_from = times[0];
                data.time_to = times[1]; 
              }
            }
          }

        }  

      }

      return data;

    }  
   
  };

  /***************************************************************************
   *
   * Selector Controller
   *
   ***************************************************************************/
  var productController = {

    /* --------------- Pickup / Return places events ----------------------- */

    /**
     * Pickup place changed
     */ 
    pickupPlaceChanged: function(pickupPlace) { 

       console.log('pickup place changed');

       productModel.pickupPlace = pickupPlace;

       // Enable return place
       if ($(productModel.return_place_selector).attr('disabled')) {
         $(productModel.return_place_selector).attr('disabled', false);
       }

       // Custom places
       if (productModel.configuration.customPickupReturnPlaces) {
         if ($(productModel.pickup_place_selector).val() == 'other') {
             $(productModel.custom_pickup_place_selector).val('true');
             $(productModel.another_pickup_place_group_selector).show();
             $(productModel.pickup_place_group_selector).hide();
         }
         else {
             $(productModel.custom_pickup_place_selector).val('false');
             $(productModel.pickup_place_other_selector).val('');
             $(productModel.another_pickup_place_group_selector).hide();
             $(productModel.pickup_place_group_selector).show();
         }
       }

       // Load the return places
       productView.loadReturnPlaces();

    },

    
    /**
     * Pickup place custom address close click
     */
    pickupPlaceAnotherGroupCloseClick: function() {
      $(productModel.pickup_place_selector).val('');
      $(productModel.pickup_place_other_selector).val('');
      $(productModel.custom_pickup_place_selector).val('false');
      $(productModel.pickup_place_group_selector).show();
      $(productModel.another_pickup_place_group_selector).hide();
    },

    /**
     * Return place changed
     */ 
    returnPlaceChanged: function() { 

        console.log('return place changed');

        // Custom places
        if (productModel.configuration.customPickupReturnPlaces) {
          if ($(productModel.return_place_selector).val() == 'other') {
              $(productModel.custom_return_place_selector).val('true');
              $(productModel.another_return_place_group_selector).show();
          }
          else {
              $(productModel.custom_return_place_selector).val('false');
              $(productModel.another_return_place_group_selector).hide();
          }
        }

       // Enable date
       productModel.productCalendar.enable();

       // Initialize date, time from, return place and time to
       productModel.productCalendar.clear();
       if (productModel.configuration.timeToFrom) {
         $(productModel.time_from_selector).val('');
         $(productModel.time_to_selector).val('');
       }

       // Load availability
       var dates = productModel.productCalendar.currentCalendarDates();
       productView.checkAvailability(dates.dateFrom, dates.dateTo);

    },

    /* -------------------- Dates events ------------------------------------*/

    durationScopeChanged: function(value) { /* The user selects duration scope */

      $('.js-mybooking-product_calendar-time-hours, .js-mybooking-product_calendar-time-ranges').hide();
      $('#reservation_detail').empty();
/*

      // Selected a range of dates => configurationtimeToFrom
      if (value === 'days') {
        productModel.showHoursTurns = productModel.configuration.timeToFrom;
      }
      else if (value === 'in_one_day') {
        productModel.showHoursTurns = productModel.configuration.timeToFromInOneDay;
      }

      productModel.productCalendar.view.setDurationScope(value);
*/

      var dates = productModel.productCalendar.currentCalendarDates();
      productView.checkAvailability(dates.dateFrom, dates.dateTo);

    },

    /**
     * First date selected
     */ 
    firstDateSelected: function(dateFrom) { /* The user selects the first date */

      console.log('first date selected');

      productModel.selectedDateFrom = null;
      productModel.selectedDateTo = null;
      $('#reservation_detail').html('');

    },

    /**
     * Date range selected
     */
    datesChanged: function(dateFrom, dateTo) {

        console.log('dates changed');

        productModel.selectedDateFrom = dateFrom;
        productModel.selectedDateTo = dateTo;    

        // == Calculate minTimeFrom and maxTimeTo
        if (productModel.availabilityData) {
          var dateFromStr = moment(dateFrom).format('YYYY-MM-DD');
          var dateToStr = moment(dateTo).format('YYYY-MM-DD');
          if (productModel.availabilityData['occupation'][dateFromStr]) {
            if (productModel.availabilityData['occupation'][dateFromStr]['ends']) {
              productModel.minTimeFrom = productModel.availabilityData['occupation'][dateFromStr]['time_to']
            }
            else {
              productModel.minTimeFrom = null;
            }
          }   
          if (productModel.availabilityData['occupation'][dateToStr]) {
            if (productModel.availabilityData['occupation'][dateToStr]['starts']) {
              productModel.maxTimeTo = productModel.availabilityData['occupation'][dateToStr]['time_from']
            }
            else {
              productModel.maxTimeTo = null;
            }          
          }  
        }

        // == Time From

        // Control if hours or turns should be shown
        productModel.showHoursTurns = false;

        if (productModel.configuration.timeToFrom || productModel.configuration.timeToFromInOneDay) {

          // Selected a range of dates => configurationtimeToFrom
          if (productView.getDurationScopeVal() === 'days') {
            productModel.showHoursTurns = productModel.configuration.timeToFrom;
          }
          else if (productView.getDurationScopeVal() === 'in_one_day') {
            productModel.showHoursTurns = productModel.configuration.timeToFromInOneDay;
          }

          if (productModel.showHoursTurns) {
            if (productModel.configuration.rentTimesSelector === 'hours') { // Select pickup/return time
              // Enable and initilize time from     
              if ($(productModel.time_from_selector).attr('disabled')) {   
                $(productModel.time_from_selector).attr('disabled', false);
              }
              $(productModel.time_from_selector).val('');
              // Enable and initialize time to
              if ($(productModel.time_to_selector).attr('disabled')) {   
                $(productModel.time_to_selector).attr('disabled', false);
              }
              $(productModel.time_to_selector).val('');          
              // Load pickup / return hours
              productView.loadPickupHours();
              productView.loadReturnHours();          
            }
            else if (productModel.configuration.rentTimesSelector === 'time_range') { // Select date/range
              // Load turns
              productView.loadTurns();
            }
          }
          else {
            // Do not show hours
            $('.js-mybooking-product_calendar-time-hours').hide();
            $('.js-mybooking-product_calendar-time-ranges').hide();
          }
        

        }

        // If no show hours/turns => Calculate price and availability
        if (!productModel.showHoursTurns) {
          productView.calculatePriceAvailability();
        }
    },

    /**
     * Month changed (check availability)
     */
    monthChanged: function(dateFrom, dateTo) {

      console.log('month changed');
      productView.checkAvailability(dateFrom, dateTo);

    },

    /**
     * Time from changed
     */  
    timeFromChanged: function() {

     console.log('time from changed');
     productView.calculatePriceAvailability();

    },

    /**
     * Time to changed
     */  
    timeToChanged: function() {

     console.log('time to changed');
     productView.calculatePriceAvailability();

    },

    /**
     * Turn selector click
     */  
    turnSelectorClick: function() {
      console.log('turn changed');
      productView.calculatePriceAvailability();
    },

    // --------- Check hourly

    checkHourlyOccupationButtonClick: function(date) {
      console.log("check hourly occupation " + date);
      productModel.checkDayOccupation(date);
    }

  };


  /***************************************************************************
   *
   * Selector View
   *
   ***************************************************************************/
  var productView = {

    init: function() {

        productModel.requestLanguage = commonSettings.language(document.documentElement.lang);
        productModel.code = $('#product_selector').attr('data-code');
        var salesChannelAttr = $('#product_selector').attr('data-sales-channel-code');
        var rentalLocationCodeAttr = $('#product_selector').attr('data-rental-location-code');
        if (typeof salesChannelAttr !== 'undefined') {
          productModel.salesChannelCode = $('#product_selector').attr('data-sales-channel-code');
        }
        if (typeof rentalLocationCodeAttr !== 'undefined') {
          productModel.rentalLocationCode = $('#product_selector').attr('data-rental-location-code');
        }
        var checkHourlyOccupationAttr = $('#product_selector').attr('data-check-hourly-occupation');
        if (typeof checkHourlyOccupationAttr !== 'undefined') {
          if ($('#product_selector').attr('data-check-hourly-occupation') === 'true') {
            productModel.checkHourlyOccupation = true;
            console.log('check-hourly-occupation');
          }
        }
        productModel.today = moment().format('YYYY-MM-DD');

        // Initialize i18next for translations
        i18next.init({  
                        lng: productModel.requestLanguage,
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
        
        // Setup Controls
        this.setupControls();

        // Setup Validation   
        this.setupValidation();

        // Start loading data
        if (productModel.configuration.pickupReturnPlace) {
          this.loadPickupPlaces();   
        }
        else {
          var dates = productModel.productCalendar.currentCalendarDates();
          productView.checkAvailability(dates.dateFrom, dates.dateTo);
        }

    },

    /* ---------------------- Setup UI controls ---------------------------- */

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
      if (document.getElementById(productModel.form_selector_tmpl)) {
        // Load the template
        var html = tmpl(productModel.form_selector_tmpl)({configuration: productModel.configuration});
        // Assign to the form
        $(productModel.form_selector).append(html);
      }

    },

    setupControls: function() {

      // Setup pickup/return places
      if (productModel.configuration.pickupReturnPlace) {
        this.setupPickupReturnPlace();
        $(productModel.return_place_selector).attr('disabled', true);
      }
      
      // Setup Date control
      this.setupDateControl();

      // Setup time from/to controls
      if (productModel.configuration.timeToFrom) {
        this.setupTimeToFrom();
        $(productModel.time_from_selector).attr('disabled', true);
        $(productModel.time_to_selector).attr('disabled', true);        
      }    

      $(productModel.add_to_shopping_cart_btn_selector).attr('disabled', true);

      // Show slider
      if ( $('.mybooking-product-carousel-inner').length ) {  
        commonUI.showSlider('.mybooking-product-carousel-inner');
      }

    },

    /**
     * Setup pickup/return place
     */
    setupPickupReturnPlace: function() {

      var pickupTime = new SelectSelector(productModel.pickup_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_pickup_place'));     

      var returnTime = new SelectSelector(productModel.return_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_return_place'));  

      var returnPlace = new SelectSelector(productModel.return_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_return_place'));    

    },

    /**
     * Setup date control
     */
    setupDateControl: function() {

      $(productModel.duration_scope_selector).off('change');
      $(productModel.duration_scope_selector).on('change', function(e){
        productController.durationScopeChanged(productView.getDurationScopeVal());
      });

      // Create the product Calendar
      productModel.productCalendar = new ProductCalendar();

      // Setup the events
      productModel.productCalendar.model.removeListeners('firstDateSelected');
      productModel.productCalendar.model.removeListeners('datesChanged');
      productModel.productCalendar.model.removeListeners('monthChanged');
      productModel.productCalendar.model.removeListeners('checkHourlyOccupationButtonClick');

      var self = this;

      productModel.productCalendar.model.addListener('firstDateSelected', function(event){

        if (event && event.type === 'firstDateSelected') {
          productController.firstDateSelected(event.data.dateFrom);
        }

      });

      productModel.productCalendar.model.addListener('datesChanged', function(event){

        if (event && event.type === 'datesChanged') {
          productController.datesChanged(event.data.dateFrom, event.data.dateTo);
        }

      });

      productModel.productCalendar.model.addListener('monthChanged', function(event){

        if (event && event.type === 'monthChanged') {
          productController.monthChanged(event.data.dateFrom, event.data.dateTo);
        }

      });

      productModel.productCalendar.model.addListener('checkHourlyOccupationButtonClick', function(event){

        if (event && event.type === 'checkHourlyOccupationButtonClick') {
          productController.checkHourlyOccupationButtonClick(event.data.date);
        }

      });

      // Initialize the calendar
      productModel.productCalendar.view.init(productModel.date_selector,
                                             i18next, 
                                             productModel.configuration, 
                                             productModel.requestLanguage,
                                             productModel.minDays,
                                             productModel.availabilityData,
                                             productModel.checkHourlyOccupation,
                                             productView.getDurationScopeVal());
      
    },

    /**
     * Setup Time controls
     */
    setupTimeToFrom: function() {

        var pickupTime = new SelectSelector(productModel.time_from_id, 
            new MemoryDataSource([]), null, true, 'hh:mm');     

        var returnTime = new SelectSelector(productModel.time_to_id, 
            new MemoryDataSource([]), null, true, 'hh:mm');  

        $(productModel.time_from_selector).bind('change', function(){
          productController.timeFromChanged();
        });

        $(productModel.time_to_selector).bind('change', function(){
          productController.timeToChanged();
        });

    },

    /**
     * Setup validation
     */
    setupValidation: function() {

        // Validator to check time_to <-> time_from when same date
        $.validator.addMethod('same_day_time_from', function(value, element) {
          if (productModel.configuration.timeToFrom) {
            var dateFromStr = moment(productModel.selectedDateFrom).format('YYYY-MM-DD');
            var dateToStr = moment(productModel.selectedDateTo).format('YYYY-MM-DD');
            if (dateFromStr == dateToStr) {
              return $(productModel.time_to_selector).val() > $(productModel.time_from_selector).val();
            }
            return true;
          }
          return true;
        });
        // Validator to check time_from min value
        $.validator.addMethod("min_time", function(value, element) {
                      if (productModel.minTimeFrom) {
                        if ($(productModel.time_from_selector).val() < productModel.minTimeFrom) {
                          return false;
                        }
                      }
                      return true;
        });
        // Validator to check time_to max value
        $.validator.addMethod("max_time", function(value, element) {
                      if (productModel.maxTimeTo) {
                        if ($(productModel.time_to_selector).val() > productModel.maxTimeTo) {
                          return false;
                        }
                      }
                      return true;
        });

        // Validation
        $(productModel.form_selector).validate({
           submitHandler: function(form) {
             // Go to complete Step
             productView.gotoNextStep();
           },
           invalidHandler: function(form)
           {
             $(productModel.form_selector + ' label.form-reservation-error').remove();
           },
           rules: {
               pickup_place: {
                   required: productModel.configuration.pickupReturnPlace
               },
               pickup_place_other: {
                   required: productModel.pickup_place_other_selector + ':visible'
               },
               return_place: {
                   required: productModel.configuration.pickupReturnPlace
               },
               return_place_other: {
                   required: productModel.pickup_place_other_selector + ':visible'
               },   
               date: {
                   required: true,
               },
               time_from: {
                   required: productModel.configuration.timeToFrom,
                   min_time: productModel.configuration.timeToFrom
               },
               time_to: {
                   required: productModel.configuration.timeToFrom,
                   same_day_time_from: true,
                   max_time: productModel.configuration.timeToFrom
               },
               promotion_code: {
                   remote: {
                       url: commonServices.URL_PREFIX + '/api/check-promotion-code',
                       type: 'POST',
                       data: {
                           code: function() {
                               return $(productModel.promotion_code_selector).val();
                           },
                           from: function() {
                               return moment(productModel.selectedDateFrom).format('YYYY-MM-DD');
                           },
                           to: function() {
                               return moment(productModel.selectedDateTo).format('YYYY-MM-DD');
                           }
                       }
                   }
               },
               accept_age: {
                   required: productModel.accept_age_selector+':visible'
               }               
           },
           messages: {
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
               date: {
                   required: i18next.t('selector.validations.dateFromRequired')
               },
               time_from: {
                   required: i18next.t('selector.validations.timeFromRequired'),
                   min_time: function() {
                                return i18next.t('calendar_selector.min_time', {time: productModel.minTimeFrom});
                             }
               },
               time_to: {
                   required:i18next.t('selector.validations.timeToRequired'),
                   same_day_time_from: i18next.t('selector.validations.sameDayTimeToGreaterTimeFrom'),
                   max_time: function() {
                                return i18next.t('calendar_selector.max_time', {time: productModel.maxTimeTo});
                             }
               },               
               promotion_code: {
                   remote: i18next.t('selector.validations.promotionCodeInvalid')
               },
               accept_age: {
                   required: i18next.t('selector.validations.acceptAge', {years: 21})
               }
           },
           errorPlacement: function (error, element) {

            error.insertAfter(element.parent());

           },
           errorClass : 'form-reservation-error'
        });

    },


    // ------------------------------------------------------------------------

    /**
     * Calculate price
     */
    calculatePriceAvailability: function() {
 
      // Disable the add to shopping cart button
      $(productModel.add_to_shopping_cart_btn_selector).attr('disabled', true);

      if (this.isDataComplete()) {
        $('#reservation_detail').empty();
        if ($(productModel.form_selector).valid()) {
          productModel.calculatePriceAvailability();
        }
      }

    },

    isDataComplete: function() {

      if (productModel.configuration.pickupReturnPlace) {
        if ($(productModel.pickup_place_selector).val() == '') {
          return false;
        }
        if ($(productModel.return_place_selector).val() == '') {
          return false;
        }
      }

      if (productModel.selectedDateFrom == null) {
        return false;
      }

      if (productModel.selectedDateTo == null) {
        return false;
      }

      if (productModel.configuration.timeToFrom || productModel.configuration.timeToFromInOneDay ) {
        if (productModel.rentTimesSelector === 'hours') { 
          if ($(productModel.time_from_selector).val() == '') {
            return false;
          }
          if ($(productModel.time_to_selector).val() == '') {
            return false;
          }      
        }  
        else if (productModel.rentTimesSelector === 'time_range') {
          if ($(this.turn_selector_val).val() == '') {
            return false;
          }
        }
      }

      return true;
    },

    /**
     * Check availability
     */
    checkAvailability: function(dateFrom, dateTo) {

      productModel.checkAvailability(dateFrom, dateTo);

    },

    /*
     * Load pickup hours
     */
    loadPickupHours: function() { /** Load return dates **/
      var date = moment(productModel.selectedDateFrom).format('YYYY-MM-DD');  
      productModel.loadPickupHours('time_from', date);
    },

    /**
     * Load return hours
     */
    loadReturnHours: function() {
      var date = moment(productModel.selectedDateTo).format('YYYY-MM-DD');  
      productModel.loadReturnHours('time_to', date);
    },

    /**
     * Load turns
     */  
    loadTurns: function() {
      var date = moment(productModel.selectedDateFrom).format('YYYY-MM-DD');
      productModel.loadTurns(date);
    },

    /**
     * Load pickup places
     */
    loadPickupPlaces: function() {

        // Setup the event
        $(productModel.pickup_place_selector).bind('change', function() {
           productController.pickupPlaceChanged($(this).val());
        });

        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/pickup-places';
        var urlParams = [];
        if (productModel.requestLanguage != null) {
          urlParams.push('lang='+productModel.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }    
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
        // DataSource
        productModel.dataSourcePickupPlaces = new RemoteDataSource(url,
                                                          {'id':'id',
                                                           'description':function(data) {
                                                               var value = data.name;
                                                               if (data.price && data.price > 0) {
                                                                   value += ' - ';
                                                                   value += 
                                                                       productModel.configuration.formatCurrency(data.price,
                                                                       productModel.configuration.currencySymbol,
                                                                       productModel.configuration.currencyDecimals,
                                                                       productModel.configuration.currencyThousandsSeparator,
                                                                       productModel.configuration.currencyDecimalMark,
                                                                       productModel.configuration.currencySymbolPosition);
                                                                   value += '';
                                                               }
                                                               return value;
                                                           }});
        var self = this;
        var pickupPlace = new SelectSelector(productModel.pickup_place_id, 
            productModel.dataSourcePickupPlaces, null, true, i18next.t('selector.select_pickup_place'),
                function() {
                  // Add other place option to the pickup places if the configuration accept custom places
                  if (productModel.configuration.customPickupReturnPlaces) {
                      if (productModel.configuration.customPickupReturnPlacePrice && 
                          productModel.configuration.customPickupReturnPlacePrice != '' && 
                          productModel.configuration.customPickupReturnPlacePrice > 0) {
                          $(productModel.pickup_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place') + ' - ' +
                                    productModel.configuration.formatCurrency(productModel.configuration.customPickupReturnPlacePrice,
                                                             productModel.configuration.currencySymbol,
                                                             productModel.configuration.currencyDecimals,
                                                             productModel.configuration.currencyThousandsSeparator,
                                                             productModel.configuration.currencyDecimalMark,
                                                             productModel.configuration.currencySymbolPosition) + ''
                          }));
                      }
                      else {
                          $(productModel.pickup_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place')
                          }));
                      }
                  }
                  
                } );
        
    },

    /**
     * Load return places
     */  
    loadReturnPlaces: function() {

        // Do not load the return places while pickup place is not setup
        if ($(productModel.pickup_place_selector).val() == '') {
          return;
        }

        // Setup the event
        $(productModel.return_place_selector).bind('change', function() {
            productController.returnPlaceChanged();
        });

        // Build URL
        var url = commonServices.URL_PREFIX + '/api/booking/frontend/return-places';
        var urlParams = [];
        urlParams.push('pickup_place='+encodeURIComponent($(productModel.pickup_place_selector).val()));
        if (productModel.requestLanguage != null) {
          urlParams.push('lang='+productModel.requestLanguage);
        }
        if (commonServices.apiKey && commonServices.apiKey != '') {
          urlParams.push('api_key='+commonServices.apiKey);
        }    
        if (urlParams.length > 0) {
          url += '?';
          url += urlParams.join('&');
        }
        // Datasource
        productModel.dataSourceReturnPlaces = new RemoteDataSource(url,
                                                          {'id':'id',
                                                           'description':function(data) {
                                                               var value = data.name;
                                                               if (data.price && data.price > 0) {
                                                                   value += ' - ';
                                                                   value += 
                                                                       productModel.configuration.formatCurrency(data.price,
                                                                       productModel.configuration.currencySymbol,
                                                                       productModel.configuration.currencyDecimals,
                                                                       productModel.configuration.currencyThousandsSeparator,
                                                                       productModel.configuration.currencyDecimalMark,
                                                                       productModel.configuration.currencySymbolPosition);
                                                                   value += '';
                                                               }
                                                               return value;
                                                           }});

        var self = this;
        var returnPlace = new SelectSelector(productModel.return_place_id, 
            productModel.dataSourceReturnPlaces, null, true, i18next.t('selector.select_return_place'),
                function() {
                  // Add other place option to the pickup places if the configuration accept custom places
                  if (productModel.configuration.customPickupReturnPlaces) {
                      if (productModel.configuration.customPickupReturnPlacePrice && 
                          productModel.configuration.customPickupReturnPlacePrice != '' && 
                          productModel.configuration.customPickupReturnPlacePrice > 0) {
                          $(productModel.return_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place') + ' - ' +
                                    productModel.configuration.formatCurrency(productModel.configuration.customPickupReturnPlacePrice,
                                                             productModel.configuration.currencySymbol,
                                                             productModel.configuration.currencyDecimals,
                                                             productModel.configuration.currencyThousandsSeparator,
                                                             productModel.configuration.currencyDecimalMark,
                                                             productModel.configuration.currencySymbolPosition) + ''
                          }));
                      }
                      else {
                          $(productModel.return_place_selector).append($('<option>', {
                              value: 'other',
                              text: i18next.t('selector.another_place')
                          }));
                      }
                  }

                  // Initialize
                  $(productModel.return_place_selector).val($(productModel.pickup_place_selector).val());
                  $(productModel.return_place_selector).trigger('change');
                } );



    },

    getDurationScopeVal: function() { /* Get duration scope value */

      if (productModel.configuration.rentingProductOneJournal && 
          productModel.configuration.rentingProductMultipleJournals) {
        return $(productModel.duration_scope_selector_val).val();
      } else {
        return $(productModel.duration_scope_selector).val();
      }


    },

    update: function(action, id) {

      switch (action) {
        case 'hours':
          if (id == 'time_from') {
            var dataSource = new MemoryDataSource(productModel.pickupHours);
            var timeFrom = null;      
            var pickupTime = new SelectSelector(productModel.time_from_id,
                dataSource, timeFrom, true, 'hh:mm',
                function() {
                    if (timeFrom != null) {
                      $(productModel.time_from_selector).val(timeFrom);
                    }
                } );
          }
          else if (id == 'time_to') {
            var dataSource = new MemoryDataSource(productModel.returnHours);
            var timeTo =  null;
            var pickupTime = new SelectSelector(productModel.time_to_id,
                dataSource, timeTo, true, 'hh:mm',
                function() {
                    if (timeTo != null) {
                      $(productModel.time_to_selector).val(timeTo);
                    }
                } );
          }
          // Show the time from / to selectors
          $('.js-mybooking-product_calendar-time-hours').show();
          // Scroll the time ranges container
          $('html, body').animate({
                  scrollTop: $(".js-mybooking-product_calendar-time-hours").offset().top
          }, 2000);          
          break;
        case 'turns':
          var turns = productModel.turns;
          if (turns === null) {
            turns = [];
          }
          var html = tmpl('form_calendar_selector_turns_tmpl')({turns: turns});
          $('#mb_product_calendar_time_ranges_container').html(html);
          if (turns.length == 1 && turns[0].full_day) {
            // Only one turn and full day => Select it and calculate
            productView.calculatePriceAvailability();
          }
          else {
            // More than one turn or one that is half day => Let the user choose
            $(productModel.turn_selector).off('change');
            $(productModel.turn_selector).on('change', function(){
              console.log('Turn selector changed');
              productController.turnSelectorClick();
            });
            // Show the time
            $('.js-mybooking-product_calendar-time-ranges').show();
            // Scroll the time ranges container
            $('html, body').animate({
                  scrollTop: $(".js-mybooking-product_calendar-time-ranges").offset().top
            }, 2000);
          }
          break;
        case 'shopping_cart':
          var html = tmpl('script_reservation_summary')({shopping_cart: productModel.shopping_cart,
                                                         configuration: productModel.configuration,
                                                         product_available: productModel.product_available,
                                                         product_type: productModel.availabilityData.type,
                                                         product: productModel.product,
                                                         i18next: i18next});
          $('#reservation_detail').html(html);
          // Add to shopping cart button
          if ($(productModel.add_to_shopping_cart_btn_selector).attr('disabled')) {
            $(productModel.add_to_shopping_cart_btn_selector).attr('disabled', false);
          }
          // Scroll the time ranges container
          $('html, body').animate({
                  scrollTop: $("#reservation_detail").offset().top
          }, 2000); 
          break;
      }

    },

    /**
     * Go to the next step (select extras or complete URL)
     */
    gotoNextStep: function() {

      if (commonServices.extrasStep) {
        window.location.href= commonServices.chooseExtrasUrl;
      }
      else {
        window.location.href= commonServices.completeUrl;
      }

    },    


  };

  var rentProductCalendar = {
    model: productModel,
    controller: productController,
    view: productView
  }
  rentEngineMediator.setProductCalendar( rentProductCalendar );

  // Check the product_selector and its data-code attribute
  if ($('#product_selector').length && $('#product_selector').attr('data-code') != 'undefined') {
    productModel.code = $('#product_selector').attr('data-code');
    productModel.loadSettings();
  }

  


});
