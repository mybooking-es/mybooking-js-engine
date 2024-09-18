/* eslint-disable max-len */
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
      prefillSelector: true,
      selectorDateToDays: 5,
      useRentingFamilies: false,
      selectFamily: false,
      multipleDestinations: false,
      multipleRentalLocations: false,
      selectDestination: false, 
      selectorRentalLocation: false,
      selectRentalLocation: false,  
      productType: null,   
      assignationTimeReturnPickup: null, 
      useDriverAgeRules: null,
      calendarShowAvailabilityNotSelectable: false,
      chooseProductMultipleRateTypes: false,
      chooseProductSearchShowFilter: false,
      literalDepositFranchise: 'deposit',
      sesHospedajes: null,
      // - Deposit literals
      depositLiteral: null,
      depositReductionLiteral: null,
      guaranteeLiteral: null,
      guaranteeReductionLiteral: null,
      driverDepositLiteral: null,
      depositTotalLiteral: null,
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
      // - Renting simple location
      simpleLocation: false,
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
      guests: false,
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
      var self = this;
      $.ajax({
           type: 'GET',
           url : url,
           contentType : 'application/json; charset=utf-8',
           crossDomain: true,
           success: function(data, textStatus, jqXHR) {
            // Hold the configuration
            self.setupConfigurationData(data);
            // Run the callback
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

    setupConfigurationData: function(data) {
      if (typeof data !== 'undefined' && data != null) {
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
             mybookingSettings.data.prefillSelector = data.prefill_selector;
             mybookingSettings.data.selectorDateToDays = data.selector_date_to_days;
             if (typeof data.prefill_selector === 'undefined') {
              mybookingSettings.data.prefillSelector = true;
              mybookingSettings.data.selectorDateToDays = 7;
             }  
             mybookingSettings.data.calendarShowAvailabilityNotSelectable = data.calendar_show_availability_not_selectable;           
             if (typeof data.calendar_show_availability_not_selectable === 'undefined') {
              mybookingSettings.data.calendarShowAvailabilityNotSelectable = true;
             } 
             mybookingSettings.data.chooseProductMultipleRateTypes = data.choose_product_multiple_rate_types;
             if (typeof data.choose_product_multiple_rate_types === 'undefined') {
              mybookingSettings.data.chooseProductMultipleRateTypes = false;
             }
             mybookingSettings.data.chooseProductSearchShowFilter = data.choose_product_search_show_filter;
             if (typeof data.choose_product_search_show_filter === 'undefined') {
              mybookingSettings.data.chooseProductSearchShowFilter = false;
             }
             if (typeof data.literal_deposit_franchise !== 'undefined') {
              mybookingSettings.data.literalDepositFranchise = data.literal_deposit_franchise;
             }
             if (typeof data.ses_hospedajes !== 'undefined') {
              mybookingSettings.data.sesHospedajes = data.ses_hospedajes;
             }
             // - Deposit literals
             mybookingSettings.data.depositLiteral = data.deposit_literal;
             mybookingSettings.data.depositReductionLiteral = data.deposit_reduction_literal;
             mybookingSettings.data.guaranteeLiteral = data.guarantee_literal;
             mybookingSettings.data.guaranteeReductionLiteral = data.guarantee_reduction_literal;
             mybookingSettings.data.driverDepositLiteral = data.driver_deposit_literal;
             mybookingSettings.data.depositTotalLiteral = data.deposit_total_literal;
             // - Desposit literals end
             mybookingSettings.data.selectFamily = data.select_family;
             mybookingSettings.data.selectDestination = data.select_destination;
             mybookingSettings.data.selectorRentalLocation = data.selector_rental_location;
             mybookingSettings.data.selectRentalLocation = data.select_rental_location;
             mybookingSettings.data.productType = data.product_type;
             mybookingSettings.data.assignationTimeReturnPickup = data.assignation_time_return_pickup;
             mybookingSettings.data.useDriverAgeRules = data.use_driver_age_rules || false;
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
             mybookingSettings.data.multipleRentalLocations = data.multiple_rental_locations || false;
             mybookingSettings.data.simpleLocation = data.simple_location || false;
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
             // - Guests
             mybookingSettings.data.guests = data.guests || false;
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
      }
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

        // Password check
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

        // Regular expression
        $.validator.addMethod(
        "regexp",
        function(value, element, regexp) {
           var re = new RegExp(regexp);
           return this.optional(element) || re.test(value);  
        });

        // Not empty
        $.validator.addMethod(
        "notempty",
        function(value, element, regexp) {
           // Only apply on visible elementos
           if ($(element).length && $(element).is(':visible')) {
             return value !== undefined && value !== null && value.trim().length > 0;  
           }
        });

        // Document validator (NIF, NIE, CIF)
        $.validator.addMethod("documentValidator", function(value, element, params) {
            value = value.toUpperCase();

            // Get the control ID of the document type
            var documentTypeControlId = params.documentTypeControlId;
            var documentType = $(documentTypeControlId).val();

            // Regexp to validate NIF, NIE and CIF
            var validChars = "TRWAGMYFPDXBNJZSQVHLCKE";
            var nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            var nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
            var cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;

            if (documentType == "1") {  // Validate NIF or CIF
                if (nifRegex.test(value)) {
                    var number = value.substr(0, 8);
                    var letter = value.substr(-1);
                    return validChars.charAt(parseInt(number) % 23) === letter;
                }
                if (cifRegex.test(value)) {
                    var digits = value.substr(1, 7);
                    var control = value.substr(-1);

                    var sumEven = 0;
                    var sumOdd = 0;
                    for (var i = 0; i < digits.length; i++) {
                        var n = parseInt(digits[i]);
                        if (i % 2 === 0) {
                            var double = (n * 2).toString();
                            sumOdd += parseInt(double[0]) + (double[1] ? parseInt(double[1]) : 0);
                        } else {
                            sumEven += n;
                        }
                    }
                    var controlDigit = (10 - ((sumEven + sumOdd) % 10)) % 10;
                    var controlLetter = "JABCDEFGHI".charAt(controlDigit);

                    if (/^[ABEH]/.test(value)) {
                        return control == controlDigit;
                    } else if (/^[KPQS]/.test(value)) {
                        return control == controlLetter;
                    } else {
                        return control == controlDigit || control == controlLetter;
                    }
                }
            } else if (documentType == "2") {  // Validate NIE
                if (nieRegex.test(value)) {
                    var niePrefix = { 'X': '0', 'Y': '1', 'Z': '2' };
                    var nieNumber = value.replace(/[XYZ]/, function(match) {
                        return niePrefix[match];
                    }).substr(0, 8);
                    var nieLetter = value.substr(-1);
                    return validChars.charAt(parseInt(nieNumber) % 23) === nieLetter;
                }
            } else if (documentType == "3" || documentType == "4") {
              // If the document type is not NIF, NIE or CIF, return true
              return true;
            } else if (documentType == "" || documentType == null) {
              return true; // No document type selected => return true
            }
            
            return false;
        }, i18next.t('complete.reservationForm.validations.invalidValue'));

    }
  };

  /**
   * On load => Check it is a sessionStorage item mbDuplicatedTab
   * 
   * Note: On Safari when the user duplicates the tab a new session is created
   *       It does not happen on Chrome or Firefox.
   * 
   * If you open the home page with selector and click on search, you can
   * check the shopping_cart free_access_id. If you duplicate the tab on
   * Safari it will create a new session and so a new instance of shopping_cart.
   * 
   * It does not happen on Chrome or Firefox. Thats the reason why we must show
   * the message
   * 
   */ 
  $(window).on('load', function(eventData){
    console.log('load Event');
    // Check to be sure it is only execute once by page
    // Wordpress with Divi Theme triggers it twice
    if (eventData.target === document) {
      console.log('Check duplicated Tab');
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

  /**
   * IOS compatibility
   */ 
  $(window).on('pagehide', function(){
    console.log('Clear duplicated tab - pagehide');
    sessionStorage.removeItem('mbDuplicatedTab');
    mybookingSettings.data.duplicatedTab = false;
  });


  return mybookingSettings;
});