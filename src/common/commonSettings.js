define('commonSettings', ['jquery','commonServices','commonLoader','commonTranslations','YSDFormatter','i18next'],
      function($, commonServices, commonLoader, commonTranslations, formatter,i18next) {

  const DEFAULT_TIME_START = '10:00';
  const DEFAULT_TIME_END = '20:00';      

  var mybookingSettings = {

    /**
     * Settings data
     */  
    data: {
      // Duplicated Tab 
      duplicatedTab: false,      
      // Server
      serverDate: null,
      serverTime: null,
      // Company
      timezone  : null,
      countryCode: null,
      currency: null,
      currencyDecimals: null,
      currencyDecimalsMark: null,
      currencySymbol: null,
      currencySymbolPosition: null,
      currencyThousandsSeparator: null,
      dateTimeFormat: null,
      dateFormat: null,
      dateShortFormat: null,
      promotionCode: true,      
      engineCustomerAccess: false,
      // Renting MODULE
      useRentingFamilies: false,
      selectFamily: false,
      multipleDestinations: false,
      selectDestination: false, 
      selectRentalLocation: false,  
      productType: null,   
      assignationTimeReturnPickup: null, 
      // - Renting dates
      minDays   : 1,
      timeToFrom: true,
      timeToFromInOneDay: false,
      halfDay: false,
      cycleOf24Hours: true,
      defaultTimeStart: null,
      defaultTimeEnd: null,
      rentDateSelector: 'date_from_date_to',
      rentTimesSelector: 'hours',
      // - Renting pickup/return place
      pickupReturnPlace: true,
      pickupReturnPlacesSameRentalLocation: false,
      customPickupReturnPlaces: false,
      customPickupReturnPlacePrice: 0,
      // - Optional external driver
      optionalExternalDriver: false,
      // - Delivery slots
      deliverySlots: false,
      // - Products
      multipleProductsSelection: false,
      multipleProductsReplicateBooking: false,
      multipleProductsReplicateBookingMax: 1,
      rentingProductOneJournal: false,
      rentingProductMultipleJournals: true,
      // - Fill data
      rentingFormFillDataAddress: false,
      rentingFormFillDataDriverDetail: false,
      rentingFromFillDataFlight: false,
      rentingFormFillDataNamedResources: false,
      rentingFormFillDataNamedResourcesHeight: false,
      rentingFormFillDataNamedResourcesWeight: false,
      rentingFormFillDataAdditionalDriver1: false,
      rentingFormFillDataAdditionalDriver2: false,      
      hidePriceIfZero: false,
      hidePriceIfNotAvailable: true,
      useCustomerClassifier: false,
      // - Product Calendar
      calendarShowDailyPrices: false,
      samePickupReturnTime: false,
      // Activities/Appointments MODULE
      activityReservationMultipleItems: true,
      selectActivityCategory: false,
      selectActivityDestination: false,
      selectActivityRentalLocation: false,
      activityCustomerVehicle: false,
      // Transfer
      transfer_allow_select_return_origin_destination: false,
      transfer_origin_destination_detailed_info_mode: 'trip',
      transferFormFillBillingAddress: false,
      formatExtraAmount: function(i18next, oneUnitPrice, priceCalculation, days, hours, amount, currencySymbol, decimals) {

        var unitAmountFormatted = this.formatCurrency(oneUnitPrice, currencySymbol, decimals);
        var amountFormatted = this.formatCurrency(amount, currencySymbol, decimals);

        var formattedAmount = null;
        if (priceCalculation == 'calculated_by_days') {
          if (days > 0) {
             formattedAmount = '<span class="extra-unitary">'+i18next.t('extra.daily_amount',{oneUnitPrice: unitAmountFormatted})+'</span>';
          }
          else if (hours > 0) {
             formattedAmount = '<span class="extra-unitary">'+i18next.t('extra.hourly_amount',{oneUnitPrice: unitAmountFormatted})+'</span>';
          }
          formattedAmount += '<br>';
          formattedAmount += '<span class="extra-total">'+i18next.t('extra.total', {total: amountFormatted})+'</span>';
        }
        else {
          formattedAmount = amountFormatted;
        }

        return formattedAmount;

      },
      formatCurrency: function(amount, currencySymbol, decimals) {
        return formatter.formatCurrency(amount, 
                                 (currencySymbol == null ? mybookingSettings.data.currencySymbol : currencySymbol), 
                                 (decimals == 0 ? 0 : (decimals || mybookingSettings.data.currencyDecimals)),
                                 mybookingSettings.data.currencyThousandsSeparator, 
                                 mybookingSettings.data.currencyDecimalsMark,
                                 mybookingSettings.data.currencySymbolPosition);
      },
      formatDateTime: function(dateTime) {
        return formatter.formatDate(date, 
                             mybookingSettings.data.dateTimeFormat, 
                             mybookingSettings.data.timezone);
      },
      formatDate: function(date) {
        return formatter.formatDate(date, 
                             mybookingSettings.data.dateFormat);
      },
      formatShortDate: function(date) {
        return formatter.formatDate(date, 
                             mybookingSettings.data.dateShortFormat);
      },

      entityMap: {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': '&quot;',
          "'": '&#39;',
          "/": '&#x2F;'
      },

      escapeHtml: function(string) {
          var self = this;
          return String(string).replace(/[&<>"'\/]/g, function (s) {
              return self.entityMap[s];
          });
      },

      encodeData: function(str) {

          return encodeURIComponent(str).replace(/%20/g, '+')

      }

    },


    /**
     * Load mybooking settings
     */ 
    loadSettings: function(callback, productType, productId) {
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/settings';
      var urlParams = [];
      if (commonServices.apiKey && commonServices.apiKey != '') {
        urlParams.push('api_key='+commonServices.apiKey);
      }       
      // Load product setup information
      if (typeof productType !== 'undefined' && productType && productType !='') {
        urlParams.push('product_type='+productType);
      }
      if (typeof productId !== 'undefined' && productId && productId !='') {
        urlParams.push('product_id='+productId);
      }
      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }
      $.ajax({
           type: 'GET',
           url : url,
           contentType : 'application/json; charset=utf-8',
           crossDomain: true,
           success: function(data, textStatus, jqXHR) {
             // Server information
             mybookingSettings.data.serverDate = data.server_date;
             mybookingSettings.data.serverTime = data.server_time;
             // Company information
             mybookingSettings.data.countryCode = data.country_code;
             mybookingSettings.data.timezone = data.timezone;
             mybookingSettings.data.currency = data.currency;
             mybookingSettings.data.currencyDecimals = data.currency_decimals;
             mybookingSettings.data.currencyDecimalsMark = data.currency_decimal_mark;
             mybookingSettings.data.currencySymbol = data.currency_symbol;
             mybookingSettings.data.currencySymbolPosition = data.currency_symbol_position;
             mybookingSettings.data.currencyThousandsSeparator = data.currency_thousands_separator;
             mybookingSettings.data.dateTimeFormat = data.frontend_datetime_format;
             mybookingSettings.data.dateFormat = data.frontend_date_format;
             mybookingSettings.data.dateShortFormat = data.frontend_short_date_format;
             mybookingSettings.data.promotionCode = data.promotion_code || false;
             // Renting
             mybookingSettings.data.useRentingFamilies = data.use_renting_families;
             mybookingSettings.data.selectFamily = data.select_family;
             mybookingSettings.data.selectDestination = data.select_destination;
             mybookingSettings.data.selectRentalLocation = data.select_rental_location;
             mybookingSettings.data.productType = data.product_type;
             mybookingSettings.data.assignationTimeReturnPickup = data.assignation_time_return_pickup;
             // - Renting dates
             mybookingSettings.data.minDays = data.min_days;
             mybookingSettings.data.timeToFrom = data.time_to_from;
             mybookingSettings.data.timeToFromInOneDay = data.time_to_from_in_one_day;
             mybookingSettings.data.halfDay = data.half_day;
             mybookingSettings.data.cycleOf24Hours = data.cycle_of_24_hours;
             mybookingSettings.data.defaultTimeStart = data.default_time_start;
             if (typeof mybookingSettings.data.defaultTimeStart === 'undefined' ||
                 mybookingSettings.data.defaultTimeStart === null || 
                 mybookingSettings.data.defaultTimeStart === '') {
               mybookingSettings.data.defaultTimeStart = DEFAULT_TIME_START;
             }
             mybookingSettings.data.defaultTimeEnd = data.default_time_end;
             if (typeof mybookingSettings.data.defaultTimeEnd === 'undefined' ||
                 mybookingSettings.data.defaultTimeStart === null || 
                 mybookingSettings.data.defaultTimeStart === '') {
               if (mybookingSettings.data.cycleOf24Hours) {
                 mybookingSettings.data.defaultTimeEnd = DEFAULT_TIME_START;
               }
               else {
                 mybookingSettings.data.defaultTimeEnd = DEFAULT_TIME_END;
               }
             }     
             mybookingSettings.data.rentDateSelector = data.rent_dates_selector;
             mybookingSettings.data.rentTimesSelector = data.rent_times_selector;
             // - Optional external driver
             mybookingSettings.data.optionalExternalDriver = data.optional_external_driver;
             // - Delivery slots
             mybookingSettings.data.deliverySlots = data.delivery_slots;
             // - Renting places
             mybookingSettings.data.multipleDestinations = data.multiple_destinations;
             mybookingSettings.data.pickupReturnPlace = data.pickup_return_place;
             mybookingSettings.data.pickupReturnPlacesSameRentalLocation = data.pickup_return_places_same_rental_location;
             mybookingSettings.data.customPickupReturnPlaces = data.custom_pickup_return_places;
             mybookingSettings.data.customPickupReturnPlacePrice = data.custom_pickup_return_place_price;
             // - Renting products
             mybookingSettings.data.multipleProductsSelection = data.multiple_products_selection || false;
             mybookingSettings.data.multipleProductsReplicateBooking = data.multiple_products_replicate_booking || false;
             mybookingSettings.data.multipleProductsReplicateBookingMax = data.multiple_products_replicate_booking_max || 1;
             mybookingSettings.data.rentingProductOneJournal = data.renting_product_one_journal;
             mybookingSettings.data.rentingProductMultipleJournals = data.renting_product_multiple_journals;
             // - Renting fill data
             mybookingSettings.data.rentingFormFillDataAddress = data.renting_form_fill_data_address || false;
             mybookingSettings.data.rentingFormFillDataDriverDetail = data.renting_form_fill_data_driver_detail || false;
             mybookingSettings.data.rentingFromFillDataFlight = data.renting_form_fill_data_flight || false;
             mybookingSettings.data.rentingFormFillDataNamedResources = data.renting_form_fill_data_named_resources || false;
             mybookingSettings.data.rentingFormFillDataNamedResourcesHeight = data.renting_form_fill_data_named_resources_height || false;
             mybookingSettings.data.rentingFormFillDataNamedResourcesWeight = data.renting_form_fill_data_named_resources_weight || false;
             mybookingSettings.data.rentingFormFillDataAdditionalDriver1 = data.renting_form_fill_data_additional_driver_1 || false;
             mybookingSettings.data.rentingFormFillDataAdditionalDriver2 = data.renting_form_fill_data_additional_driver_2 || false;     
             // - Hide price if zero
             mybookingSettings.data.hidePriceIfZero = data.hide_price_if_zero || false;
             if (typeof data.hide_price_if_not_available !== 'undefined') {
               mybookingSettings.data.hidePriceIfNotAvailable = data.hide_price_if_not_available;
             }
             // - Use customer classifier
             mybookingSettings.data.useCustomerClassifier = data.use_customer_classifier || false;
             // - Renting calendar
             mybookingSettings.data.calendarShowDailyPrices = data.calendar_show_daily_prices;
             mybookingSettings.data.samePickupReturnTime = data.same_pickup_return_time;
             // Activities / Appointments
             mybookingSettings.data.activityReservationMultipleItems = data.activity_reservation_multiple_items;
             mybookingSettings.data.activityCustomerVehicle = data.activity_customer_vehicle;
             mybookingSettings.data.selectActivityCategory = data.select_activity_category;
             mybookingSettings.data.selectActivityDestination = data.select_activity_destination;
             mybookingSettings.data.selectActivityRentalLocation = data.select_activity_rental_location;
             // Transfer
             mybookingSettings.data.transfer_allow_select_return_origin_destination = data.transfer_allow_select_return_origin_destination;
             mybookingSettings.data.transfer_origin_destination_detailed_info_mode = data.transfer_origin_destination_detailed_info_mode;
             mybookingSettings.data.transferFormFillBillingAddress = data.transfer_form_fill_billing_address;
             // Customer access
             if (typeof data.engine_customer_access !== 'undefined') {
               mybookingSettings.data.engineCustomerAccess = true;
             }
             if (callback) {
                callback(mybookingSettings.data);
             }
           },
           error: function(data, textStatus, jqXHR) {
             // Hide the loader if error
             commonLoader.hide();
             alert('Error obteniendo la información');
           }
      });
    },

    /**
     * Get page language
     */ 
    language: function(language) {
      if (typeof language != 'undefined' && language != null) {
        if (language.length && language.length > 2) {
          return language.substring(0,2);
        }
        else {
          return language;
        }
      }
    },

    /**
     * Get URL vars from location
     */ 
    getUrlVars: function() {
          var vars = [], hash;
          var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
          for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
          }
          return vars;
    },

    /**
     * Get URL vars from string
     */ 
    getUrlVarsFromString: function(address) {
          var vars = [], hash;
          var hashes = address.slice(address.indexOf('?') + 1).split('&');
          for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
          }
          return vars;
    },

    /**
     * Append common validators
     * 
     * - pwcheck
     * 
     */ 
    appendValidators: function() {

        $.validator.addMethod("pwcheck", function(value, element) {
           if ( $(element).length > 0 && $(element).is(':visible') ) {
             return  /^[A-Za-z0-9\d=!\-@._*&]*$/.test(value) // consists of only these
                     && /[a-z]/.test(value) // has a lowercase letter
                     && /[A-Z]/.test(value) // has a uppercase letter
                     && /\d/.test(value) // has a digit
                     && /[=!\-@._*&]/.test(value); // has a symbol
           }
           return true;
        });
      
    }
  };

  /**
   * On load => Check it is a sessionStorage item mbDuplicatedTab
   */ 
  $(window).on('load', function(){
    // If exists a duplicated Tab item in season => 
    if (sessionStorage.getItem('mbDuplicatedTab') === 'duplicatedTab') {
      console.log('duplicated TAB');
      mybookingSettings.data.duplicatedTab = true;
    }
    else {
      sessionStorage.setItem('mbDuplicatedTab', 'duplicatedTab');
      console.log('Not duplicated TAB');
      mybookingSettings.data.duplicatedTab = false;
    }
  });

  /**
   * Before unload => Remove mbDuplicatedTab (it is not executed when duplicate tab)
   */ 
  $(window).on('beforeunload', function(){
    console.log('Clear duplicated tab - beforeunload');
    sessionStorage.removeItem('mbDuplicatedTab');
    mybookingSettings.data.duplicatedTab = false;
  });
  // ios compatibility
  $(window).on('pagehide', function(){
    console.log('Clear duplicated tab - pagehide');
    sessionStorage.removeItem('mbDuplicatedTab');
    mybookingSettings.data.duplicatedTab = false;
  })

  return mybookingSettings;
});