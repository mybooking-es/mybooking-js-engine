define('selector', ['jquery', 'YSDMemoryDataSource', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices','commonSettings', 'commonTranslations', 'commonLoader',
         './../mediator/rentEngineMediator',
         'i18next', 'moment', 'ysdtemplate',
         'jquery.i18next',
         'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
         'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
         'jquery.ui.datepicker.validation'],
         function($, MemoryDataSource, RemoteDataSource, SelectSelector,
                  commonServices, commonSettings, commonTranslations, commonLoader, rentEngineMediator,
                  i18next, moment, tmpl) {

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
    pickupPlace: null, // Selected pickup/place
    selectedDateFrom: null, // Selected date from
    selectedDateTo: null, // Selected date to
    shoppingCartId: null, // The shoppingCart Id

    availabilityData: null, // Availability data
    pickupHours: [],  // Available pickup hours
    returnHours: [],  // Available return hours

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
    // same pickup/return place
    same_pickup_return_place_selector: '#same_pickup_return_place',
    // return place
    return_place_id: 'return_place',
    return_place_selector: '#return_place',
    return_place_other_selector: '#pickup_place_other',
    return_place_container_selector: '.return_place',
    return_place_group_selector: '.return_place_group',   
    custom_return_place_selector: 'input[name=custom_pickup_place]',
    another_return_place_group_selector: '#another_pickup_place_group',
    // == Date selector
    date_selector: '#date',
    // == Time From / To selector
    // time from
    time_from_id: 'time_from',
    time_from_selector: '#time_from',
    // time to
    time_to_id: 'time_to',        
    time_to_selector: '#time_to',  
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
      });
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

      $.ajax({
        type: 'GET',
        url : url,
        contentType : 'application/json; charset=utf-8',
        success: function(data, textStatus, jqXHR) {
            productModel.availabilityData = data;
            // Rebuild calendar
            $('#date').data('dateRangePicker').redraw();
            // Activate the control
            $('#date-container').removeClass('disabled-picker');
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
      // Request             
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.pickupHours = data;
          productView.update('hours', id, data);
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
      // Request                  
      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
          self.returnHours = data;
          productView.update('hours', id, data);
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

      if (this.configuration.timeToFrom) {
        data.time_from = $(this.time_from_selector).val();
        data.time_to = $(this.time_to_selector).val();
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

       if (productModel.configuration.pickupReturnPlace) {
         if (!$(productModel.same_pickup_return_place_selector).is(':checked')) {
           $(productModel.return_place_selector).val('');
         }
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
     * Pickup place custom address autocomplete changed
     */
    pickupPlaceAnotherChanged: function() {

     if ($(productModel.same_pickup_return_place_selector).is(':checked')) {
        $(productModel.return_place_selector).val('other');
        $(productModel.custom_return_place_selector).val('true');
        $(productModel.return_place_other_selector).val($(productModel.pickup_place_other_selector).val());
     }

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
     * Same pickup / return place changed
     */
    samePickupReturnPlaceChanged: function() {

      if ($(productModel.same_pickup_return_place_selector).is(':checked')) {
        $(productModel.return_place_selector).val($(productModel.pickup_place_selector).val());
        $(productModel.return_place_container_selector).hide();
      }
      else {
        $(productModel.return_place_container_selector).show();
      }

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

       // Enable date from        
       if ($(productModel.date_selector).attr('disabled')) {
         $(productModel.date_selector).attr('disabled', false);
       }

       // Initialize date, time from, return place and time to
       $(productModel.date_selector).datepicker('setDate', null);
       if (productModel.configuration.timeToFrom) {
         $(productModel.time_from_selector).val('');
         $(productModel.time_to_selector).val('');
       }

       // Load availability
       productView.checkAvailability();

    },

    /* -------------------- Dates events ------------------------------------*/

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

        // ==Time From
        if (productModel.configuration.timeToFrom) {
          // Enable time from     
          if ($(productModel.time_from_selector).attr('disabled')) {   
            $(productModel.time_from_selector).attr('disabled', false);
          }
          // Initialize time from
          $(productModel.time_from_selector).val('');
          // Enable time to
          if ($(productModel.time_to_selector).attr('disabled')) {   
            $(productModel.time_to_selector).attr('disabled', false);
          }
          // Initialize time from
          $(productModel.time_to_selector).val('');          
          // Load pickup / return hours
          productView.loadPickupHours();
          productView.loadReturnHours();          
        }

        // Calculate price
        productView.calculatePriceAvailability();

    },

    /**
     * Month changed (check availability)
     */
    monthChanged: function() {

      console.log('month changed');
      productView.checkAvailability();

    },

    timeFromChanged: function() {

     console.log('time from changed');
     productView.calculatePriceAvailability();

    },

    timeToChanged: function() {

     console.log('time to changed');
     productView.calculatePriceAvailability();

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
          productView.checkAvailability();
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
      $('#date-container').addClass('disabled-picker');

      // Setup time from/to controls
      if (productModel.configuration.timeToFrom) {
        this.setupTimeToFrom();
        $(productModel.time_from_selector).attr('disabled', true);
        $(productModel.time_to_selector).attr('disabled', true);        
      }    

      $(productModel.add_to_shopping_cart_btn_selector).attr('disabled', true);

    },

    /**
     * Setup pickup/return place
     */
    setupPickupReturnPlace: function() {

      var pickupTime = new SelectSelector(productModel.pickup_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_pickup_place'));     

      var returnTime = new SelectSelector(productModel.return_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_return_place'));  

      $(productModel.same_pickup_return_place_selector).bind('change', function(){
        productController.samePickupReturnPlaceChanged();
      });

      var returnPlace = new SelectSelector(productModel.return_place_id, 
          new MemoryDataSource([]), null, true, i18next.t('selector.select_return_place'));    

    },

    /**
     * Setup date control
     */
    setupDateControl: function() {

      // For index Page coding
      $('#date').dateRangePicker(
      {
          inline:true,
          container: '#date-container',
          alwaysOpen: true,
          stickyMonths: true,
          allowSelectBetweenInvalid: true,
          singleDate: (productModel.configuration.datesSelector === 'single_date'), /* Single date selector */
          singleMonth: (productModel.configuration.datesSelector === 'single_date' ? true : false), /* Single date one month */
          time: {
            enabled: false
          },
          startOfWeek: 'monday',
          language: productModel.requestLanguage,
          minDays: productModel.configuration.minDays,
          showTopbar: false,
          customTopBar: '',
          extraClass: '',
          beforeShowDay: function(date) {
            var theDate = moment(date.setHours(0,0,0,0)).format('YYYY-MM-DD');
            // Before showing a date
            // Check the past
            if (theDate< productModel.today) {
              return [false];
            }
            var info = null;
            // Check the availability
            if (productModel.availabilityData) {
              // Day is not selectable [calendar]
              if (productModel.availabilityData['occupation'][theDate] && !productModel.availabilityData['occupation'][theDate].selectable_day) {
                return [false, 'not-selectable-day']; // The reservation can not start or end on the date 
              }    
              // Product is not available [rent]
              else if (productModel.availabilityData['occupation'][theDate] && !productModel.availabilityData['occupation'][theDate].free) {
                return [false, 'busy-data bg-danger'];
              }
              // If a reservation starts/end the the date [info message]
              if (productModel.availabilityData['occupation'][theDate]) {
                if (productModel.availabilityData['occupation'][theDate]['warning_occupied']) {
                  info = productModel.availabilityData['occupation'][theDate]['warning_occupied_message'];
                }
              }
            }
            // Make sure that when the daterangepicker is refreshed to hold the selection
            var startDate = productModel.selectedDateFrom ? moment(productModel.selectedDateFrom).format('YYYY-MM-DD') : null;
            var endDate = productModel.selectedDateTo ? moment(productModel.selectedDateTo).format('YYYY-MM-DD') : null;
            if (startDate && endDate) {
              if (theDate == startDate && theDate == endDate) {
                return [true, 'checked last-date-selected first-date-selected'];
              }
              else if (theDate == startDate) {
                return [true, 'checked first-date-selected'];
              }
              else if (theDate == endDate) {
                return [true, 'checked last-date-selected'];
              }
              else if (theDate >= startDate && theDate <= endDate) {
                return [true, 'checked'];
              }
            }
            return [true, (info == null ? 'date-available' : 'bg-warning'), (info == null ? '' : info)];
          },
          hoveringTooltip: false         
      })
      .bind('datepicker-first-date-selected', function(event, obj){
        productController.firstDateSelected(obj.date1);
      })
      .bind('datepicker-change',function(event,obj) {
        productController.datesChanged(obj.date1, obj.date2 || obj.date1);
      });
      // Avoid Google Automatic Translation
      $('#date-container').addClass('notranslate');
      // Bind navigation events
      $('#date-container .next').bind('click', function(){
        productController.monthChanged();
      });
      $('#date-container .prev').bind('click', function(){
        productController.monthChanged();
      });

      setTimeout(function(){
        var width = $('#date-container').width();
        $('.date-picker-wrapper').css('width', '100%');
        $('.month-wrapper').css('width', 'inherit');
        $('.month-wrapper table').css('width', 'inherit');
        $('.month-wrapper table th').css('width', width/7+'px');
      }, 100);
      

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


        $(productModel.form_selector).validate({
           submitHandler: function(form) {
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

      if (productModel.configuration.timeToFrom) {
        if ($(productModel.time_from_selector).val() == '') {
          return false;
        }
        if ($(productModel.time_to_selector).val() == '') {
          return false;
        }        
      }

      return true;
    },

    /**
     * Check availability
     */
    checkAvailability: function() {

        var month1 = $('#date').data('dateRangePicker').opt.month1;
        var month2 = month1;
        
        if (productModel.configuration.datesSelector === 'start_end_date') {
          month2 = $('#date').data('dateRangePicker').opt.month2;
        }

        var m1 = moment(month1).format('YYYY-MM-DD');
        var m2 = moment(month2).add(1, 'month').format('YYYY-MM-DD');

        // Chek availibility
        productModel.checkAvailability(m1, m2);
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
    productModel.loadSettings();
  }

  


});
