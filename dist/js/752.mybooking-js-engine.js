(self["webpackChunkmybooking_js_engine"] = self["webpackChunkmybooking_js_engine"] || []).push([[752],{

/***/ 2752:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9755), __webpack_require__(3302), __webpack_require__(6288),__webpack_require__(9901),
         __webpack_require__(144),__webpack_require__(8041), __webpack_require__(6066), __webpack_require__(2638),
         __webpack_require__(5435), __webpack_require__(967),__webpack_require__(7049), __webpack_require__(6489), __webpack_require__(2166),
         __webpack_require__(5805), __webpack_require__(2663), __webpack_require__(350),
         __webpack_require__(7192), __webpack_require__(9650), __webpack_require__(6218),
         __webpack_require__(5237)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($, MemoryDataSource, RemoteDataSource, SelectSelector,
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
    this.form_selector = 'form[name=transfer_search_form]';

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
    this.rountrip_id = 'rountrip';
    this.rountrip_selector = '.rountrip';
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
    this.dataSourceOriginPoints = null; // Origin points datasource
    this.dataSourceDestinationPoints = null; // Destination points datasource
    this.dataSourceTime = [ // TODO
        "08:00",
        "08:30",
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
    ];

    this.requestLanguage = null;
    this.configuration = null;
    this.shopping_cart = null;
    /* this.shopping_cart = { // TODO
      origin_point: 1,
      destination_point: 1,
      date: "2021-08-30",
      time: "08:00",
      return_origin_point: 2,
      return_destination_point: 2,
      return_date: "2021-09-30",
      return_time: "10:30",
      number_of_adults: 2,
      number_of_children: 3,
      number_of_infants: 1,
      rountrip: true,
    } */;
    this.loadedShoppingCart = false;

    this.setSelectorView = function(_selectorView) {
        this.selectorView = _selectorView;
    }

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

    this.dateChanged = function () {
      var onewayDate = $(this.selectorModel.date_selector).datepicker('getDate') ? $(this.selectorModel.date_selector).datepicker('getDate').getTime() : null;
      var twowayDate = $(this.selectorModel.return_date_selector).datepicker('getDate') ? $(this.selectorModel.return_date_selector).datepicker('getDate').getTime() : null;
      if (onewayDate !== null && twowayDate !== null && onewayDate >= twowayDate) {
        var date = new Date(twowayDate);
        var day  = date.getDate() - 1;
        var month  = date.getMonth() + 1;
        var year  = date.getFullYear();
        window.alert('La fecha de vuelta no puede ser mayor a la de ida.');
        $(this.selectorModel.date_selector).datepicker('setDate', day + '/' + month + '/' + year);
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
        this.setupControls();

        // Setup date settings
        this.loadDate('date');
        this.loadDate('return_date');

        // Setup date settings
        this.loadTime('time');
        this.loadTime('return_time');
        
        // Setup origin and destination points
        this.loadOriginPoints('origin_point');
        if (this.selectorModel.shopping_cart) {
          this.loadDestinationPoints('destination_point');
        }
        this.loadOriginPoints('return_origin_point');
        if (this.selectorModel.shopping_cart) {
          this.loadDestinationPoints('return_destination_point');
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

        // Setup rountrip
        if (this.selectorModel.shopping_cart) {
          $('input:radio[name=' + this.selectorModel.rountrip_id + ']:checked').attr('checked', false);
          $('input:radio[value=' + this.selectorModel.shopping_cart.rountrip + ']').attr('checked', true);
          $(this.selectorModel.rountrip_selector).trigger('change');
        }

    }
    
    /**
     * Load settings
     */
    this.loadSettings = function () {
      var self = this;

      commonLoader.show();
      return commonSettings.loadSettings(function(data){
          self.selectorModel.configuration = data;
          commonLoader.hide();
          self.init();
      });
    }

    /**
    * Load date
    */
    this.loadDate = function(idSelector) {
      var date;
      if (this.selectorModel.shopping_cart) {
        date = new Date(this.selectorModel.shopping_cart[idSelector]);
      }
      if (date) {
        $(this.selectorModel[idSelector + '_selector']).datepicker('setDate', date);
      }
    };

    /**
    * Load time
    */
    this.loadTime = function(idSelector) {

      var self = this;

      var time;
      if (this.selectorModel.shopping_cart) {
        time = this.selectorModel.shopping_cart[idSelector];
      }

      if (!this.selectorModel.shopping_cart || !this.selectorModel.shopping_cart[idSelector]) {
        $(this.selectorModel[idSelector + '_selector']).append('<option value=""> - No selection - </option>');
      }
      $.each(this.selectorModel.dataSourceTime, function (i, item) {
        if (self.selectorModel.shopping_cart && self.selectorModel.shopping_cart[idSelector] === item) {
          $(self.selectorModel[idSelector + '_selector']).append($('<option selected="selected"></option>').val(item).html(item));
        } else {
          $(self.selectorModel[idSelector + '_selector']).append($('<option></option>').val(item).html(item));
        }
      });

    };
    
    /**
    * Load origin points
    */
    this.loadOriginPoints = function(idSelector) {

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

      this.addSelector(idSelector, this.selectorModel.dataSourceOriginPoints);
    }

    /**
    * Load destination points
    */
    this.loadDestinationPoints = function(idSelector, clearInput) {
      var self = this;

      // Build URL
      var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/destination-points';
      var urlParams = [];
      urlParams.push('origin_point_id='+encodeURIComponent($(this.selectorModel.origin_point).val()));
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
      this.selectorModel.dataSourceDestinationPoints = new RemoteDataSource(url,
          {
          'id':'id',
          'description': function(data) {
              return data.name;
          }});

      this.addSelector(idSelector, this.selectorModel.dataSourceDestinationPoints, clearInput);
      $(this.selectorModel[idSelector + '_selector']).attr('disabled', false);
    }

    /**
    * Add data to inputs selects
    */
    this.addSelector = function (idSelector, dataSource, clearInput) {
      var self = this;

      new SelectSelector(this.selectorModel[idSelector + '_id'], 
              dataSource, 
              null, 
              true, 
              i18next.t('selector.select_pickup_place'),
            function(data) {
              if (self.selectorModel.shopping_cart && !clearInput) {
                $(self.selectorModel[idSelector + '_selector']).val(self.selectorModel.shopping_cart[idSelector]);
              }
            });
    }

    /**
    * Setup controls
    */
    this.setupControls = function () {
      var self = this;

      // ------------------------ Setup controls --------------------------------
      $(this.selectorModel.origin_point_selector).bind('change', function(value) {
        self.loadDestinationPoints('destination_point', true);
      });
      $(this.selectorModel.return_origin_point_selector).bind('change', function(value) {
        self.loadDestinationPoints('return_destination_point', true);
      });

      this.setupDateControl('date');
      this.setupDateControl('return_date');

      $(this.selectorModel.rountrip_selector).bind('change', function(event) {
        var value = event.currentTarget.value;
        if (value === 'true') {
          $(self.selectorModel.return_block_selector).show();
        } else {
          $(self.selectorModel.return_block_selector).hide();
        }
      });

      this.setupFormControl();

    }

    this.setupDateControl = function (idSelector) {
      var self = this;

      $.datepicker.setDefaults( $.datepicker.regional[this.selectorModel.requestLanguage || 'es'] );
      var locale = $.datepicker.regional[this.selectorModel.requestLanguage || 'es'];
      var maxDate = moment().add(365, 'days').tz(this.selectorModel.configuration.timezone).format(this.selectorModel.configuration.dateFormat);
      $(this.selectorModel[idSelector + '_selector']).datepicker({
        numberOfMonths:1,
        maxDate: maxDate,
        minDate: new Date(),
        dateFormat: 'dd/mm/yy',
        onSelect: function() {
          self.selectorController.dateChanged();     
       }
      }, locale);

      // Avoid Google Automatic Translation
      $('.ui-datepicker').addClass('notranslate');
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
            origin_point: {
                required: self.selectorModel.origin_point_selector,
            },
            destination_point: {
                required: self.selectorModel.destination_point_selector,
            },
            rountrip: {
                required: self.selectorModel.rountrip_selector,
            },
            return_date: {
                required: self.selectorModel.return_date_selector + ':visible',
            },
            return_time: {
                required: self.selectorModel.return_time_selector + ':visible',
            },
            return_origin_point: {
                required: self.selectorModel.return_origin_point_selector + ':visible',
            },
            return_destination_point: {
                required: self.selectorModel.return_destination_point_selector + ':visible',
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
            origin_point: {
                required: i18next.t('common.required'),
            },
            destination_point: {
                required: i18next.t('common.required'),
            },
            rountrip: {
                required: i18next.t('common.required'),
            },
            return_date: {
                required: i18next.t('common.required'),
            },
            return_time: {
                required: i18next.t('common.required'),
            },
            return_origin_point: {
                required: i18next.t('common.required'),
            },
            return_destination_point: {
                required: i18next.t('common.required'),
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
    this.view.loadSettings();

  }

  return SelectorTransfer;

}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3RyYW5zZmVyL3NlbGVjdG9yL1NlbGVjdG9yVHJhbnNmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBMkIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFxQixFQUFFLHlCQUFxQixDQUFDLHlCQUFtQjtBQUN0RyxTQUFTLHdCQUFnQixDQUFDLHlCQUFnQixFQUFFLHlCQUFvQixFQUFFLHlCQUFjO0FBQ2hGLFNBQVMseUJBQVMsRUFBRSx3QkFBUSxDQUFDLHlCQUFhLEVBQUUseUJBQVEsRUFBRSx5QkFBZ0I7QUFDdEUsU0FBUyx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUNsRSxTQUFTLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN4RixTQUFTLHlCQUFpQyxDQUFDLG1DQUNsQztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXVDO0FBQ3ZDLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7O0FBRVY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE87QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPOztBQUVQOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0Q7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUOztBQUVBOztBQUVBLFNBQVM7QUFDVDtBQUNBLE1BQU07QUFDTjs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLENBQUM7QUFBQSxrR0FBQyIsImZpbGUiOiI3NTIubXlib29raW5nLWpzLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgnU2VsZWN0b3JUcmFuc2ZlcicsIFsnanF1ZXJ5JywgJ1lTRE1lbW9yeURhdGFTb3VyY2UnLCAnWVNEUmVtb3RlRGF0YVNvdXJjZScsJ1lTRFNlbGVjdFNlbGVjdG9yJyxcbiAgICAgICAgICdjb21tb25TZXJ2aWNlcycsJ2NvbW1vblNldHRpbmdzJywgJ2NvbW1vblRyYW5zbGF0aW9ucycsICdjb21tb25Mb2FkZXInLFxuICAgICAgICAgJ2kxOG5leHQnLCAnbW9tZW50JywneXNkdGVtcGxhdGUnLCAnY29va2llJywgJ2pxdWVyeS5pMThuZXh0JyxcbiAgICAgICAgICdqcXVlcnkudmFsaWRhdGUnLCAnanF1ZXJ5LnVpJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVzJyxcbiAgICAgICAgICdqcXVlcnkudWkuZGF0ZXBpY2tlci1lbicsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1jYScsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1pdCcsXG4gICAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXIudmFsaWRhdGlvbiddLFxuICAgICAgICAgZnVuY3Rpb24oJCwgTWVtb3J5RGF0YVNvdXJjZSwgUmVtb3RlRGF0YVNvdXJjZSwgU2VsZWN0U2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICBjb21tb25TZXJ2aWNlcywgY29tbW9uU2V0dGluZ3MsIGNvbW1vblRyYW5zbGF0aW9ucywgY29tbW9uTG9hZGVyLCBcbiAgICAgICAgICAgICAgICAgIGkxOG5leHQsIG1vbWVudCwgdG1wbCwgY29va2llKSB7XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKlxuICAgKiBTZWxlY3RvciBUcmFuc2ZlciBNb2RlbFxuICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICB2YXIgU2VsZWN0b3JUcmFuc2Zlck1vZGVsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLnNlbGVjdG9yVmlldyA9IG51bGw7XG5cbiAgICAvLyA9PSBTZWxlY3RvcnNcblxuICAgIC8vIFNlYXJjaCBmb3JtXG4gICAgdGhpcy5mb3JtX3NlbGVjdG9yID0gJ2Zvcm1bbmFtZT10cmFuc2Zlcl9zZWFyY2hfZm9ybV0nO1xuXG4gICAgLy8gRGF0ZVxuICAgIHRoaXMuZGF0ZV9pZCA9ICdkYXRlJztcbiAgICB0aGlzLmRhdGVfc2VsZWN0b3IgPSAnI2RhdGUnO1xuXG4gICAgLy8gVGltZVxuICAgIHRoaXMudGltZV9pZCA9ICd0aW1lJztcbiAgICB0aGlzLnRpbWVfc2VsZWN0b3IgPSAnI3RpbWUnO1xuXG4gICAgLy8gT3JpZ2luIHBvaW50XG4gICAgdGhpcy5vcmlnaW5fcG9pbnRfaWQgPSAnb3JpZ2luX3BvaW50JztcbiAgICB0aGlzLm9yaWdpbl9wb2ludF9zZWxlY3RvciA9ICcjb3JpZ2luX3BvaW50JztcbiAgICBcbiAgICAvLyBEZXN0aW5hdGlvbiBwb2ludFxuICAgIHRoaXMuZGVzdGluYXRpb25fcG9pbnRfaWQgPSAnZGVzdGluYXRpb25fcG9pbnQnOyAgIFxuICAgIHRoaXMuZGVzdGluYXRpb25fcG9pbnRfc2VsZWN0b3IgPSAnI2Rlc3RpbmF0aW9uX3BvaW50JztcblxuICAgIC8vIE9uZSAvIFR3byB3YXlzIHRyaXBcbiAgICB0aGlzLnJvdW50cmlwX2lkID0gJ3JvdW50cmlwJztcbiAgICB0aGlzLnJvdW50cmlwX3NlbGVjdG9yID0gJy5yb3VudHJpcCc7XG4gICAgdGhpcy5yZXR1cm5fYmxvY2tfaWQgPSAncmV0dXJuX2Jsb2NrJztcbiAgICB0aGlzLnJldHVybl9ibG9ja19zZWxlY3RvciA9ICcjcmV0dXJuX2Jsb2NrJztcblxuICAgIC8vIFJldHVybiBEYXRlXG4gICAgdGhpcy5yZXR1cm5fZGF0ZV9pZCA9ICdyZXR1cm5fZGF0ZSc7XG4gICAgdGhpcy5yZXR1cm5fZGF0ZV9zZWxlY3RvciA9ICcjcmV0dXJuX2RhdGUnO1xuXG4gICAgLy8gUmV0dXJuIFRpbWVcbiAgICB0aGlzLnJldHVybl90aW1lX2lkID0gJ3JldHVybl90aW1lJztcbiAgICB0aGlzLnJldHVybl90aW1lX3NlbGVjdG9yID0gJyNyZXR1cm5fdGltZSc7XG5cbiAgICAvLyBSZXR1cm4gT3JpZ2luIHBvaW50XG4gICAgdGhpcy5yZXR1cm5fb3JpZ2luX3BvaW50X2lkID0gJ3JldHVybl9vcmlnaW5fcG9pbnQnO1xuICAgIHRoaXMucmV0dXJuX29yaWdpbl9wb2ludF9zZWxlY3RvciA9ICcjcmV0dXJuX29yaWdpbl9wb2ludCc7XG4gICAgXG4gICAgLy8gUmV0dXJuIERlc3RpbmF0aW9uIHBvaW50XG4gICAgdGhpcy5yZXR1cm5fZGVzdGluYXRpb25fcG9pbnRfaWQgPSAncmV0dXJuX2Rlc3RpbmF0aW9uX3BvaW50JzsgICBcbiAgICB0aGlzLnJldHVybl9kZXN0aW5hdGlvbl9wb2ludF9zZWxlY3RvciA9ICcjcmV0dXJuX2Rlc3RpbmF0aW9uX3BvaW50JztcblxuICAgIC8vIE51bWJlciBvZiBwZW9wbGVcbiAgICB0aGlzLm51bWJlcl9vZl9hZHVsdHNfaWQgPSAnbnVtYmVyX29mX2FkdWx0cyc7XG4gICAgdGhpcy5udW1iZXJfb2ZfYWR1bHRzX3NlbGVjdG9yID0gJyNudW1iZXJfb2ZfYWR1bHRzJztcbiAgICB0aGlzLm51bWJlcl9vZl9jaGlsZHJlbl9pZCA9ICdudW1iZXJfb2ZfY2hpbGRyZW4nO1xuICAgIHRoaXMubnVtYmVyX29mX2NoaWxkcmVuX3NlbGVjdG9yID0gJyNudW1iZXJfb2ZfY2hpbGRyZW4nO1xuICAgIHRoaXMubnVtYmVyX29mX2luZmFudHNfaWQgPSAnbnVtYmVyX29mX2luZmFudHMnO1xuICAgIHRoaXMubnVtYmVyX29mX2luZmFudHNfc2VsZWN0b3IgPSAnI251bWJlcl9vZl9pbmZhbnRzJztcblxuICAgIC8vID09IFN0YXRlIHZhcmlhYmxlc1xuICAgIHRoaXMuZGF0YVNvdXJjZU9yaWdpblBvaW50cyA9IG51bGw7IC8vIE9yaWdpbiBwb2ludHMgZGF0YXNvdXJjZVxuICAgIHRoaXMuZGF0YVNvdXJjZURlc3RpbmF0aW9uUG9pbnRzID0gbnVsbDsgLy8gRGVzdGluYXRpb24gcG9pbnRzIGRhdGFzb3VyY2VcbiAgICB0aGlzLmRhdGFTb3VyY2VUaW1lID0gWyAvLyBUT0RPXG4gICAgICAgIFwiMDg6MDBcIixcbiAgICAgICAgXCIwODozMFwiLFxuICAgICAgICBcIjA5OjAwXCIsXG4gICAgICAgIFwiMDk6MzBcIixcbiAgICAgICAgXCIxMDowMFwiLFxuICAgICAgICBcIjEwOjMwXCIsXG4gICAgICAgIFwiMTE6MDBcIixcbiAgICAgICAgXCIxMTozMFwiLFxuICAgICAgICBcIjEyOjAwXCIsXG4gICAgICAgIFwiMTI6MzBcIixcbiAgICAgICAgXCIxMzowMFwiLFxuICAgICAgICBcIjEzOjMwXCIsXG4gICAgXTtcblxuICAgIHRoaXMucmVxdWVzdExhbmd1YWdlID0gbnVsbDtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBudWxsO1xuICAgIHRoaXMuc2hvcHBpbmdfY2FydCA9IG51bGw7XG4gICAgLyogdGhpcy5zaG9wcGluZ19jYXJ0ID0geyAvLyBUT0RPXG4gICAgICBvcmlnaW5fcG9pbnQ6IDEsXG4gICAgICBkZXN0aW5hdGlvbl9wb2ludDogMSxcbiAgICAgIGRhdGU6IFwiMjAyMS0wOC0zMFwiLFxuICAgICAgdGltZTogXCIwODowMFwiLFxuICAgICAgcmV0dXJuX29yaWdpbl9wb2ludDogMixcbiAgICAgIHJldHVybl9kZXN0aW5hdGlvbl9wb2ludDogMixcbiAgICAgIHJldHVybl9kYXRlOiBcIjIwMjEtMDktMzBcIixcbiAgICAgIHJldHVybl90aW1lOiBcIjEwOjMwXCIsXG4gICAgICBudW1iZXJfb2ZfYWR1bHRzOiAyLFxuICAgICAgbnVtYmVyX29mX2NoaWxkcmVuOiAzLFxuICAgICAgbnVtYmVyX29mX2luZmFudHM6IDEsXG4gICAgICByb3VudHJpcDogdHJ1ZSxcbiAgICB9ICovO1xuICAgIHRoaXMubG9hZGVkU2hvcHBpbmdDYXJ0ID0gZmFsc2U7XG5cbiAgICB0aGlzLnNldFNlbGVjdG9yVmlldyA9IGZ1bmN0aW9uKF9zZWxlY3RvclZpZXcpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclZpZXcgPSBfc2VsZWN0b3JWaWV3O1xuICAgIH1cblxuICB9O1xuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICpcbiAgICogU2VsZWN0b3IgVHJhbnNmZXIgQ29udHJvbGxlclxuICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICB2YXIgU2VsZWN0b3JUcmFuc2ZlckNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuc2VsZWN0b3JWaWV3ID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdG9yTW9kZWwgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBzZWxlY3RvciB2aWV3XG4gICAgICovXG4gICAgdGhpcy5zZXRTZWxlY3RvclZpZXcgPSBmdW5jdGlvbiggX3NlbGVjdG9yVmlldyApIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclZpZXcgPSBfc2VsZWN0b3JWaWV3O1xuICAgIH1cbiAgXG4gICAgLyoqXG4gICAgKiBTZXQgdGhlIHNlbGVjdG9yIG1vZGVsXG4gICAgKi9cbiAgICB0aGlzLnNldFNlbGVjdG9yTW9kZWwgPSBmdW5jdGlvbiggX3NlbGVjdG9yTW9kZWwgKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JNb2RlbCA9IF9zZWxlY3Rvck1vZGVsO1xuICAgIH1cblxuICAgIHRoaXMuZGF0ZUNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb25ld2F5RGF0ZSA9ICQodGhpcy5zZWxlY3Rvck1vZGVsLmRhdGVfc2VsZWN0b3IpLmRhdGVwaWNrZXIoJ2dldERhdGUnKSA/ICQodGhpcy5zZWxlY3Rvck1vZGVsLmRhdGVfc2VsZWN0b3IpLmRhdGVwaWNrZXIoJ2dldERhdGUnKS5nZXRUaW1lKCkgOiBudWxsO1xuICAgICAgdmFyIHR3b3dheURhdGUgPSAkKHRoaXMuc2VsZWN0b3JNb2RlbC5yZXR1cm5fZGF0ZV9zZWxlY3RvcikuZGF0ZXBpY2tlcignZ2V0RGF0ZScpID8gJCh0aGlzLnNlbGVjdG9yTW9kZWwucmV0dXJuX2RhdGVfc2VsZWN0b3IpLmRhdGVwaWNrZXIoJ2dldERhdGUnKS5nZXRUaW1lKCkgOiBudWxsO1xuICAgICAgaWYgKG9uZXdheURhdGUgIT09IG51bGwgJiYgdHdvd2F5RGF0ZSAhPT0gbnVsbCAmJiBvbmV3YXlEYXRlID49IHR3b3dheURhdGUpIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0d293YXlEYXRlKTtcbiAgICAgICAgdmFyIGRheSAgPSBkYXRlLmdldERhdGUoKSAtIDE7XG4gICAgICAgIHZhciBtb250aCAgPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgICAgICB2YXIgeWVhciAgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnTGEgZmVjaGEgZGUgdnVlbHRhIG5vIHB1ZWRlIHNlciBtYXlvciBhIGxhIGRlIGlkYS4nKTtcbiAgICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWwuZGF0ZV9zZWxlY3RvcikuZGF0ZXBpY2tlcignc2V0RGF0ZScsIGRheSArICcvJyArIG1vbnRoICsgJy8nICsgeWVhcik7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgfTtcblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICpcbiAgICogU2VsZWN0b3IgVHJhbnNmZXIgVmlld1xuICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICB2YXIgU2VsZWN0b3JUcmFuc2ZlclZpZXcgPSBmdW5jdGlvbihfc2VsZWN0b3JNb2RlbCwgX3NlbGVjdG9yQ29udHJvbGxlcikge1xuXG4gICAgdGhpcy5zZWxlY3Rvck1vZGVsID0gX3NlbGVjdG9yTW9kZWw7XG4gICAgdGhpcy5zZWxlY3RvckNvbnRyb2xsZXIgPSBfc2VsZWN0b3JDb250cm9sbGVyO1xuXG4gICAgLyoqXG4gICAgICogSW5pdFxuICAgICAqL1xuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBTZXR1cCByZXF1ZXN0IGxhbmd1YWdlIGFuZCBzZXR0aW5nc1xuICAgICAgICB0aGlzLnNlbGVjdG9yTW9kZWwucmVxdWVzdExhbmd1YWdlID0gY29tbW9uU2V0dGluZ3MubGFuZ3VhZ2UoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcpO1xuXG4gICAgICAgIC8vIFNldHVwIGNvbnRyb2xzXG4gICAgICAgIHRoaXMuc2V0dXBDb250cm9scygpO1xuXG4gICAgICAgIC8vIFNldHVwIGRhdGUgc2V0dGluZ3NcbiAgICAgICAgdGhpcy5sb2FkRGF0ZSgnZGF0ZScpO1xuICAgICAgICB0aGlzLmxvYWREYXRlKCdyZXR1cm5fZGF0ZScpO1xuXG4gICAgICAgIC8vIFNldHVwIGRhdGUgc2V0dGluZ3NcbiAgICAgICAgdGhpcy5sb2FkVGltZSgndGltZScpO1xuICAgICAgICB0aGlzLmxvYWRUaW1lKCdyZXR1cm5fdGltZScpO1xuICAgICAgICBcbiAgICAgICAgLy8gU2V0dXAgb3JpZ2luIGFuZCBkZXN0aW5hdGlvbiBwb2ludHNcbiAgICAgICAgdGhpcy5sb2FkT3JpZ2luUG9pbnRzKCdvcmlnaW5fcG9pbnQnKTtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0KSB7XG4gICAgICAgICAgdGhpcy5sb2FkRGVzdGluYXRpb25Qb2ludHMoJ2Rlc3RpbmF0aW9uX3BvaW50Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkT3JpZ2luUG9pbnRzKCdyZXR1cm5fb3JpZ2luX3BvaW50Jyk7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwuc2hvcHBpbmdfY2FydCkge1xuICAgICAgICAgIHRoaXMubG9hZERlc3RpbmF0aW9uUG9pbnRzKCdyZXR1cm5fZGVzdGluYXRpb25fcG9pbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIG51bWJlciBvZiBwZW9wbGVcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0KSB7XG4gICAgICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWwubnVtYmVyX29mX2FkdWx0c19zZWxlY3RvcikudmFsKHRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0Lm51bWJlcl9vZl9hZHVsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwuc2hvcHBpbmdfY2FydCkge1xuICAgICAgICAgICQodGhpcy5zZWxlY3Rvck1vZGVsLm51bWJlcl9vZl9jaGlsZHJlbl9zZWxlY3RvcikudmFsKHRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0Lm51bWJlcl9vZl9jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0KSB7XG4gICAgICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWwubnVtYmVyX29mX2luZmFudHNfc2VsZWN0b3IpLnZhbCh0aGlzLnNlbGVjdG9yTW9kZWwuc2hvcHBpbmdfY2FydC5udW1iZXJfb2ZfaW5mYW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXR1cCByb3VudHJpcFxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnQpIHtcbiAgICAgICAgICAkKCdpbnB1dDpyYWRpb1tuYW1lPScgKyB0aGlzLnNlbGVjdG9yTW9kZWwucm91bnRyaXBfaWQgKyAnXTpjaGVja2VkJykuYXR0cignY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgICAgICAkKCdpbnB1dDpyYWRpb1t2YWx1ZT0nICsgdGhpcy5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnQucm91bnRyaXAgKyAnXScpLmF0dHIoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgICAgICAkKHRoaXMuc2VsZWN0b3JNb2RlbC5yb3VudHJpcF9zZWxlY3RvcikudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBMb2FkIHNldHRpbmdzXG4gICAgICovXG4gICAgdGhpcy5sb2FkU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGNvbW1vbkxvYWRlci5zaG93KCk7XG4gICAgICByZXR1cm4gY29tbW9uU2V0dGluZ3MubG9hZFNldHRpbmdzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgIHNlbGYuc2VsZWN0b3JNb2RlbC5jb25maWd1cmF0aW9uID0gZGF0YTtcbiAgICAgICAgICBjb21tb25Mb2FkZXIuaGlkZSgpO1xuICAgICAgICAgIHNlbGYuaW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBMb2FkIGRhdGVcbiAgICAqL1xuICAgIHRoaXMubG9hZERhdGUgPSBmdW5jdGlvbihpZFNlbGVjdG9yKSB7XG4gICAgICB2YXIgZGF0ZTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwuc2hvcHBpbmdfY2FydCkge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUodGhpcy5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnRbaWRTZWxlY3Rvcl0pO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWxbaWRTZWxlY3RvciArICdfc2VsZWN0b3InXSkuZGF0ZXBpY2tlcignc2V0RGF0ZScsIGRhdGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAqIExvYWQgdGltZVxuICAgICovXG4gICAgdGhpcy5sb2FkVGltZSA9IGZ1bmN0aW9uKGlkU2VsZWN0b3IpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgdGltZTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwuc2hvcHBpbmdfY2FydCkge1xuICAgICAgICB0aW1lID0gdGhpcy5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnRbaWRTZWxlY3Rvcl07XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnQgfHwgIXRoaXMuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0W2lkU2VsZWN0b3JdKSB7XG4gICAgICAgICQodGhpcy5zZWxlY3Rvck1vZGVsW2lkU2VsZWN0b3IgKyAnX3NlbGVjdG9yJ10pLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIlwiPiAtIE5vIHNlbGVjdGlvbiAtIDwvb3B0aW9uPicpO1xuICAgICAgfVxuICAgICAgJC5lYWNoKHRoaXMuc2VsZWN0b3JNb2RlbC5kYXRhU291cmNlVGltZSwgZnVuY3Rpb24gKGksIGl0ZW0pIHtcbiAgICAgICAgaWYgKHNlbGYuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0ICYmIHNlbGYuc2VsZWN0b3JNb2RlbC5zaG9wcGluZ19jYXJ0W2lkU2VsZWN0b3JdID09PSBpdGVtKSB7XG4gICAgICAgICAgJChzZWxmLnNlbGVjdG9yTW9kZWxbaWRTZWxlY3RvciArICdfc2VsZWN0b3InXSkuYXBwZW5kKCQoJzxvcHRpb24gc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiPjwvb3B0aW9uPicpLnZhbChpdGVtKS5odG1sKGl0ZW0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKHNlbGYuc2VsZWN0b3JNb2RlbFtpZFNlbGVjdG9yICsgJ19zZWxlY3RvciddKS5hcHBlbmQoJCgnPG9wdGlvbj48L29wdGlvbj4nKS52YWwoaXRlbSkuaHRtbChpdGVtKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAqIExvYWQgb3JpZ2luIHBvaW50c1xuICAgICovXG4gICAgdGhpcy5sb2FkT3JpZ2luUG9pbnRzID0gZnVuY3Rpb24oaWRTZWxlY3Rvcikge1xuXG4gICAgICAvLyBCdWlsZCBVUkxcbiAgICAgIHZhciB1cmwgPSBjb21tb25TZXJ2aWNlcy5VUkxfUFJFRklYICsgJy9hcGkvYm9va2luZy10cmFuc2Zlci9mcm9udGVuZC9vcmlnaW4tcG9pbnRzJztcbiAgICAgIHZhciB1cmxQYXJhbXMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwucmVxdWVzdExhbmd1YWdlICE9IG51bGwpIHtcbiAgICAgIHVybFBhcmFtcy5wdXNoKCdsYW5nPScrdGhpcy5zZWxlY3Rvck1vZGVsLnJlcXVlc3RMYW5ndWFnZSk7XG4gICAgICB9XG4gICAgICBpZiAoY29tbW9uU2VydmljZXMuYXBpS2V5ICYmIGNvbW1vblNlcnZpY2VzLmFwaUtleSAhPSAnJykge1xuICAgICAgdXJsUGFyYW1zLnB1c2goJ2FwaV9rZXk9Jytjb21tb25TZXJ2aWNlcy5hcGlLZXkpO1xuICAgICAgfSAgICBcbiAgICAgIGlmICh1cmxQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgdXJsICs9ICc/JztcbiAgICAgIHVybCArPSB1cmxQYXJhbXMuam9pbignJicpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBEYXRhU291cmNlXG4gICAgICB0aGlzLnNlbGVjdG9yTW9kZWwuZGF0YVNvdXJjZU9yaWdpblBvaW50cyA9IG5ldyBSZW1vdGVEYXRhU291cmNlKHVybCxcbiAgICAgICAge1xuICAgICAgICAnaWQnOidpZCcsXG4gICAgICAgICdkZXNjcmlwdGlvbic6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLm5hbWU7XG4gICAgICAgIH19KTtcblxuICAgICAgdGhpcy5hZGRTZWxlY3RvcihpZFNlbGVjdG9yLCB0aGlzLnNlbGVjdG9yTW9kZWwuZGF0YVNvdXJjZU9yaWdpblBvaW50cyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBMb2FkIGRlc3RpbmF0aW9uIHBvaW50c1xuICAgICovXG4gICAgdGhpcy5sb2FkRGVzdGluYXRpb25Qb2ludHMgPSBmdW5jdGlvbihpZFNlbGVjdG9yLCBjbGVhcklucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIEJ1aWxkIFVSTFxuICAgICAgdmFyIHVybCA9IGNvbW1vblNlcnZpY2VzLlVSTF9QUkVGSVggKyAnL2FwaS9ib29raW5nLXRyYW5zZmVyL2Zyb250ZW5kL2Rlc3RpbmF0aW9uLXBvaW50cyc7XG4gICAgICB2YXIgdXJsUGFyYW1zID0gW107XG4gICAgICB1cmxQYXJhbXMucHVzaCgnb3JpZ2luX3BvaW50X2lkPScrZW5jb2RlVVJJQ29tcG9uZW50KCQodGhpcy5zZWxlY3Rvck1vZGVsLm9yaWdpbl9wb2ludCkudmFsKCkpKTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdG9yTW9kZWwucmVxdWVzdExhbmd1YWdlICE9IG51bGwpIHtcbiAgICAgICAgdXJsUGFyYW1zLnB1c2goJ2xhbmc9Jyt0aGlzLnNlbGVjdG9yTW9kZWwucmVxdWVzdExhbmd1YWdlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb21tb25TZXJ2aWNlcy5hcGlLZXkgJiYgY29tbW9uU2VydmljZXMuYXBpS2V5ICE9ICcnKSB7XG4gICAgICAgIHVybFBhcmFtcy5wdXNoKCdhcGlfa2V5PScrY29tbW9uU2VydmljZXMuYXBpS2V5KTtcbiAgICAgIH0gICAgXG4gICAgICBpZiAodXJsUGFyYW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdXJsICs9ICc/JztcbiAgICAgICAgdXJsICs9IHVybFBhcmFtcy5qb2luKCcmJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIERhdGFTb3VyY2VcbiAgICAgIHRoaXMuc2VsZWN0b3JNb2RlbC5kYXRhU291cmNlRGVzdGluYXRpb25Qb2ludHMgPSBuZXcgUmVtb3RlRGF0YVNvdXJjZSh1cmwsXG4gICAgICAgICAge1xuICAgICAgICAgICdpZCc6J2lkJyxcbiAgICAgICAgICAnZGVzY3JpcHRpb24nOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkYXRhLm5hbWU7XG4gICAgICAgICAgfX0pO1xuXG4gICAgICB0aGlzLmFkZFNlbGVjdG9yKGlkU2VsZWN0b3IsIHRoaXMuc2VsZWN0b3JNb2RlbC5kYXRhU291cmNlRGVzdGluYXRpb25Qb2ludHMsIGNsZWFySW5wdXQpO1xuICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWxbaWRTZWxlY3RvciArICdfc2VsZWN0b3InXSkuYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBBZGQgZGF0YSB0byBpbnB1dHMgc2VsZWN0c1xuICAgICovXG4gICAgdGhpcy5hZGRTZWxlY3RvciA9IGZ1bmN0aW9uIChpZFNlbGVjdG9yLCBkYXRhU291cmNlLCBjbGVhcklucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIG5ldyBTZWxlY3RTZWxlY3Rvcih0aGlzLnNlbGVjdG9yTW9kZWxbaWRTZWxlY3RvciArICdfaWQnXSwgXG4gICAgICAgICAgICAgIGRhdGFTb3VyY2UsIFxuICAgICAgICAgICAgICBudWxsLCBcbiAgICAgICAgICAgICAgdHJ1ZSwgXG4gICAgICAgICAgICAgIGkxOG5leHQudCgnc2VsZWN0b3Iuc2VsZWN0X3BpY2t1cF9wbGFjZScpLFxuICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnQgJiYgIWNsZWFySW5wdXQpIHtcbiAgICAgICAgICAgICAgICAkKHNlbGYuc2VsZWN0b3JNb2RlbFtpZFNlbGVjdG9yICsgJ19zZWxlY3RvciddKS52YWwoc2VsZi5zZWxlY3Rvck1vZGVsLnNob3BwaW5nX2NhcnRbaWRTZWxlY3Rvcl0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFNldHVwIGNvbnRyb2xzXG4gICAgKi9cbiAgICB0aGlzLnNldHVwQ29udHJvbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBTZXR1cCBjb250cm9scyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWwub3JpZ2luX3BvaW50X3NlbGVjdG9yKS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBzZWxmLmxvYWREZXN0aW5hdGlvblBvaW50cygnZGVzdGluYXRpb25fcG9pbnQnLCB0cnVlKTtcbiAgICAgIH0pO1xuICAgICAgJCh0aGlzLnNlbGVjdG9yTW9kZWwucmV0dXJuX29yaWdpbl9wb2ludF9zZWxlY3RvcikuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgc2VsZi5sb2FkRGVzdGluYXRpb25Qb2ludHMoJ3JldHVybl9kZXN0aW5hdGlvbl9wb2ludCcsIHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0dXBEYXRlQ29udHJvbCgnZGF0ZScpO1xuICAgICAgdGhpcy5zZXR1cERhdGVDb250cm9sKCdyZXR1cm5fZGF0ZScpO1xuXG4gICAgICAkKHRoaXMuc2VsZWN0b3JNb2RlbC5yb3VudHJpcF9zZWxlY3RvcikuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAkKHNlbGYuc2VsZWN0b3JNb2RlbC5yZXR1cm5fYmxvY2tfc2VsZWN0b3IpLnNob3coKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKHNlbGYuc2VsZWN0b3JNb2RlbC5yZXR1cm5fYmxvY2tfc2VsZWN0b3IpLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0dXBGb3JtQ29udHJvbCgpO1xuXG4gICAgfVxuXG4gICAgdGhpcy5zZXR1cERhdGVDb250cm9sID0gZnVuY3Rpb24gKGlkU2VsZWN0b3IpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5kYXRlcGlja2VyLnNldERlZmF1bHRzKCAkLmRhdGVwaWNrZXIucmVnaW9uYWxbdGhpcy5zZWxlY3Rvck1vZGVsLnJlcXVlc3RMYW5ndWFnZSB8fMKgJ2VzJ10gKTtcbiAgICAgIHZhciBsb2NhbGUgPSAkLmRhdGVwaWNrZXIucmVnaW9uYWxbdGhpcy5zZWxlY3Rvck1vZGVsLnJlcXVlc3RMYW5ndWFnZSB8fMKgJ2VzJ107XG4gICAgICB2YXIgbWF4RGF0ZSA9IG1vbWVudCgpLmFkZCgzNjUsICdkYXlzJykudHoodGhpcy5zZWxlY3Rvck1vZGVsLmNvbmZpZ3VyYXRpb24udGltZXpvbmUpLmZvcm1hdCh0aGlzLnNlbGVjdG9yTW9kZWwuY29uZmlndXJhdGlvbi5kYXRlRm9ybWF0KTtcbiAgICAgICQodGhpcy5zZWxlY3Rvck1vZGVsW2lkU2VsZWN0b3IgKyAnX3NlbGVjdG9yJ10pLmRhdGVwaWNrZXIoe1xuICAgICAgICBudW1iZXJPZk1vbnRoczoxLFxuICAgICAgICBtYXhEYXRlOiBtYXhEYXRlLFxuICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICBkYXRlRm9ybWF0OiAnZGQvbW0veXknLFxuICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5zZWxlY3RvckNvbnRyb2xsZXIuZGF0ZUNoYW5nZWQoKTsgICAgIFxuICAgICAgIH1cbiAgICAgIH0sIGxvY2FsZSk7XG5cbiAgICAgIC8vIEF2b2lkIEdvb2dsZSBBdXRvbWF0aWMgVHJhbnNsYXRpb25cbiAgICAgICQoJy51aS1kYXRlcGlja2VyJykuYWRkQ2xhc3MoJ25vdHJhbnNsYXRlJyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXR1cEZvcm1Db250cm9sID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkKHRoaXMuc2VsZWN0b3JNb2RlbC5mb3JtX3NlbGVjdG9yKS52YWxpZGF0ZSh7XG4gICAgICAgIGludmFsaWRIYW5kbGVyOiBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgICAgJChzZWxmLnNlbGVjdG9yTW9kZWwuZm9ybV9zZWxlY3RvciArICcgbGFiZWwuZm9ybS1yZXNlcnZhdGlvbi1lcnJvcicpLnJlbW92ZSgpO1xuICAgICAgICB9LFxuICAgICAgICBydWxlczoge1xuICAgICAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwuZGF0ZV9zZWxlY3RvcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHNlbGYuc2VsZWN0b3JNb2RlbC50aW1lX3NlbGVjdG9yLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9yaWdpbl9wb2ludDoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwub3JpZ2luX3BvaW50X3NlbGVjdG9yLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uX3BvaW50OiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHNlbGYuc2VsZWN0b3JNb2RlbC5kZXN0aW5hdGlvbl9wb2ludF9zZWxlY3RvcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByb3VudHJpcDoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwucm91bnRyaXBfc2VsZWN0b3IsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmV0dXJuX2RhdGU6IHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogc2VsZi5zZWxlY3Rvck1vZGVsLnJldHVybl9kYXRlX3NlbGVjdG9yICsgJzp2aXNpYmxlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXR1cm5fdGltZToge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwucmV0dXJuX3RpbWVfc2VsZWN0b3IgKyAnOnZpc2libGUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJldHVybl9vcmlnaW5fcG9pbnQ6IHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogc2VsZi5zZWxlY3Rvck1vZGVsLnJldHVybl9vcmlnaW5fcG9pbnRfc2VsZWN0b3IgKyAnOnZpc2libGUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJldHVybl9kZXN0aW5hdGlvbl9wb2ludDoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwucmV0dXJuX2Rlc3RpbmF0aW9uX3BvaW50X3NlbGVjdG9yICsgJzp2aXNpYmxlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBudW1iZXJfb2ZfYWR1bHRzOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHNlbGYuc2VsZWN0b3JNb2RlbC5udW1iZXJfb2ZfYWR1bHRzX3NlbGVjdG9yXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbnVtYmVyX29mX2NoaWxkcmVuOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IHNlbGYuc2VsZWN0b3JNb2RlbC5udW1iZXJfb2ZfY2hpbGRyZW5fc2VsZWN0b3JcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBudW1iZXJfb2ZfaW5mYW50czoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBzZWxmLnNlbGVjdG9yTW9kZWwubnVtYmVyX29mX2luZmFudHNfc2VsZWN0b3JcbiAgICAgICAgICAgIH0sICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogaTE4bmV4dC50KCdjb21tb24ucmVxdWlyZWQnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3JpZ2luX3BvaW50OiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVzdGluYXRpb25fcG9pbnQ6IHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogaTE4bmV4dC50KCdjb21tb24ucmVxdWlyZWQnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByb3VudHJpcDoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBpMThuZXh0LnQoJ2NvbW1vbi5yZXF1aXJlZCcpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJldHVybl9kYXRlOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmV0dXJuX3RpbWU6IHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogaTE4bmV4dC50KCdjb21tb24ucmVxdWlyZWQnKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXR1cm5fb3JpZ2luX3BvaW50OiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmV0dXJuX2Rlc3RpbmF0aW9uX3BvaW50OiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbnVtYmVyX29mX2FkdWx0czoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBpMThuZXh0LnQoJ2NvbW1vbi5yZXF1aXJlZCcpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG51bWJlcl9vZl9jaGlsZHJlbjoge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBpMThuZXh0LnQoJ2NvbW1vbi5yZXF1aXJlZCcpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG51bWJlcl9vZl9pbmZhbnRzOiB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGkxOG5leHQudCgnY29tbW9uLnJlcXVpcmVkJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gKGVycm9yLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICBlcnJvci5pbnNlcnRBZnRlcihlbGVtZW50LnBhcmVudCgpKTtcbiAgICBcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3JDbGFzcyA6ICdmb3JtLXJlc2VydmF0aW9uLWVycm9yJ1xuICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgU2VsZWN0b3JUcmFuc2ZlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc29sZS5sb2coJ1NlbGVjdG9yIFRyYW5zZmVyJyk7XG5cbiAgICB0aGlzLm1vZGVsID0gbmV3IFNlbGVjdG9yVHJhbnNmZXJNb2RlbCgpO1xuICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBTZWxlY3RvclRyYW5zZmVyQ29udHJvbGxlcigpO1xuICAgIHRoaXMudmlldyA9IG5ldyBTZWxlY3RvclRyYW5zZmVyVmlldyh0aGlzLm1vZGVsLCB0aGlzLmNvbnRyb2xsZXIpO1xuXG4gICAgdGhpcy5jb250cm9sbGVyLnNldFNlbGVjdG9yVmlldyh0aGlzLnZpZXcpO1xuICAgIHRoaXMuY29udHJvbGxlci5zZXRTZWxlY3Rvck1vZGVsKHRoaXMubW9kZWwpO1xuICAgIHRoaXMubW9kZWwuc2V0U2VsZWN0b3JWaWV3KHRoaXMudmlldyk7XG5cbiAgICAkKHRoaXMubW9kZWwucmV0dXJuX2Jsb2NrX3NlbGVjdG9yKS5oaWRlKCk7XG4gICAgJCh0aGlzLm1vZGVsLmRlc3RpbmF0aW9uX3BvaW50X3NlbGVjdG9yKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICQodGhpcy5tb2RlbC5yZXR1cm5fZGVzdGluYXRpb25fcG9pbnRfc2VsZWN0b3IpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LmxvYWRTZXR0aW5ncygpO1xuXG4gIH1cblxuICByZXR1cm4gU2VsZWN0b3JUcmFuc2ZlcjtcblxufSk7XG4iXSwic291cmNlUm9vdCI6IiJ9