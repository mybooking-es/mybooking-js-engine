define('ProductCalendar', ['jquery', 'YSDEventTarget', 
       'moment',        'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
       'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
       'jquery.ui.datepicker.validation'],
       function($, YSDEventTarget, moment) {


  /***************************************************************************
   *
   * Model
   *
   ***************************************************************************/
  var ProductCalendarModel = function() {

    this.updatingData = false;

    // Selected DateFrom
    this.selectedDateFrom = null;
    // Selected DateTo
    this.selectedDateTo = null;

    // Date Selector
    this.dateSelector = '#date';
    this.durationScope = 'days';
    // Configuration
    this.configuration = null;
    // i18next
    this.i18next = null;
    // Availability Data
    this.availabilityData = null;
    // Check hourly availability
    this.checkHourlyOccupation = false;

    // Events Management
    this.events = new YSDEventTarget();

    // View
    this.productCalendarView = null;

    // ---- Events

    this.addListener = function(type, listener) { /* addListener */
      this.events.addEventListener(type, listener);  
    }
    
    this.removeListener = function(type, listener) { /* removeListener */
      this.events.removeEventListener(type, listener);     
    }

    this.removeListeners = function(type) { /* remove listeners*/
     this.events.removeEventListeners(type);
    }

    // ----- Setters

    /**
     * Set the view
     */ 
    this.setProductCalendarView = function(_productCalendarView) {
      this.productCalendarView = _productCalendarView;
    }

  }
  
  /***************************************************************************
   *
   * Controller
   *
   ***************************************************************************/  
  var ProductCalendarController = function() {

    this.productCalendarView = null;
    this.productCalendarModel = null;

    /**
     * Set the view
     */
    this.setProductCalendarView = function( _productCalendarView ) {
      this.productCalendarView = _productCalendarView;
    }

    /**
     * Set the model
     */
    this.setProductCalendarModel = function( _productCalendarModel ) {
      this.productCalendarModel = _productCalendarModel;
    }

    // --------- Calendar EVENTS

    /**
     * First date selected
     */ 
    this.firstDateSelected = function(dateFrom) { /* The user selects the first date */

      console.log('first date selected');

      this.productCalendarModel.selectedDateFrom = null;
      this.productCalendarModel.selectedDateTo = null;
      this.productCalendarModel.events.fireEvent({type: 'firstDateSelected', data: {dateFrom: dateFrom} });

    },

    /**
     * Date range selected
     */
    this.datesChanged = function(dateFrom, dateTo) {

      console.log('dates changed');

      this.productCalendarModel.selectedDateFrom = dateFrom;
      this.productCalendarModel.selectedDateTo = dateTo;    

      this.productCalendarModel.events.fireEvent({type: 'datesChanged', data: {dateFrom: dateFrom, dateTo: dateTo} });
    },

    /**
     * Month changed (check availability)
     */
    this.monthChanged = function() {

      console.log('month changed');

      var dates = this.productCalendarView.currentCalendarDates();

      this.productCalendarModel.events.fireEvent({type: 'monthChanged', data: {dateFrom: dates.dateFrom, 
                                                                         dateTo: dates.dateTo}});

    }

    // -------- Check hourly occupation

    this.checkHourlyOccupationButtonClick = function(date) {

       this.productCalendarModel.events.fireEvent({type: 'checkHourlyOccupationButtonClick', data: {date: date}});

    }


  }

  /***************************************************************************
   *
   * View
   *
   ***************************************************************************/
  var ProductCalendarView = function(_selectorModel, _selectorController) {

    this.productCalendarModel = _selectorModel;
    this.productCalendarController = _selectorController;

    this.currentCalendarDates = function() {

      var month1 = $(this.productCalendarModel.dateSelector).data('dateRangePicker').opt.month1;
      var month2 = month1;

      if (!$('#date').data('dateRangePicker').opt.singleMonth) { 
        month2 = $('#date').data('dateRangePicker').opt.month2;
      }

      var m1 = moment(month1).format('YYYY-MM-DD');
      var m2 = moment(month2).add(1, 'month').format('YYYY-MM-DD');

      var result =  {dateFrom: m1, 
                     dateTo: m2};

      return result;     

    }

    /**
     * Initialize
     */
    this.init = function(dateSelector, 
                         i18next,
                         configuration,
                         requestLanguage, 
                         minDays, 
                         availabilityData, 
                         checkHourlyOccupation,
                         durationScope,
                         selectDurationScope) {

      // Disable Container
      $('#date-container').addClass('disabled-picker');

      this.productCalendarModel.dateSelector = dateSelector;
      this.productCalendarModel.i18next = i18next;
      this.productCalendarModel.configuration = configuration;
      this.productCalendarModel.availabilityData = availabilityData;
      this.productCalendarModel.availabilityData = availabilityData;
      this.productCalendarModel.checkHourlyOccupation = checkHourlyOccupation;
      var today = moment().format('YYYY-MM-DD');

      var self = this;

      // Duraction scope => Select hours / turn in a date or select date ranges
      var singleDate = false;
      var singleMonth = false;
      durationScope ||= 'days';
      this.productCalendarModel.durationScope = durationScope;
      if ( this.productCalendarModel.durationScope === 'in_one_day' ) {
        singleDate = true;
      }

      // Reservation in one day without selector => One month
      if (!selectDurationScope && durationScope == 'in_one_day') {
        singleMonth = true;
      }

      console.log('durationScope :' + durationScope);

      // For index Page coding
      $(dateSelector).dateRangePicker(
      {
          inline:true,
          container: '#date-container',
          alwaysOpen: true,
          stickyMonths: true,
          allowSelectBetweenInvalid: false, //true,
          singleDate: singleDate, /* Single date selector */
          singleMonth: singleMonth, /* Single date one month */
          time: {
            enabled: false
          },
          startOfWeek: 'monday',
          language: requestLanguage,
          minDays: minDays,
          showTopbar: false,
          customTopBar: '',
          extraClass: '',
          selectForward: true,
          beforeShowDay: function(date) {
            var theDate = moment(date.setHours(0,0,0,0)).format('YYYY-MM-DD');
            // Before showing a date
            // Check the past
            if (theDate< today) {
              return [false];
            }
            var info = null;
            // Check the availability
            if (self.productCalendarModel.availabilityData) {
              // Day is not selectable [calendar]
              if (self.productCalendarModel.availabilityData['occupation'][theDate] && !self.productCalendarModel.availabilityData['occupation'][theDate].selectable_day) {
                return [true, 'not-selectable-day']; // The reservation can not start or end on the date 
              }    
              // Product is not available [rent]
              else if (self.productCalendarModel.availabilityData['occupation'][theDate] && !self.productCalendarModel.availabilityData['occupation'][theDate].free) {
                return [false, 'busy-data bg-danger'];
              }
              // If a reservation starts/end the the date [info message]
              if (self.productCalendarModel.availabilityData['occupation'][theDate]) {
                if (self.productCalendarModel.availabilityData['occupation'][theDate]['warning_occupied']) {
                  info = self.productCalendarModel.availabilityData['occupation'][theDate]['warning_occupied_message'];
                }
              }
            }
            // Make sure that when the daterangepicker is refreshed to hold the selection
            var startDate = self.productCalendarModel.selectedDateFrom ? moment(self.productCalendarModel.selectedDateFrom).format('YYYY-MM-DD') : null;
            var endDate = self.productCalendarModel.selectedDateTo ? moment(self.productCalendarModel.selectedDateTo).format('YYYY-MM-DD') : null;
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
          showDateFilter: function(time, date)
          {
            var dateStr = moment(time).format('YYYY-MM-DD');
            var renderPrice = "<div class=\"mybooking-product_calendar-price\">&nbsp;</div>";
            var renderMinDays =  "<div class=\"mybooking-product_calendar-mindays\">&nbsp;</div>";
            var renderCheckHourlyOccupation = "";
            // Show prices
            if (self.productCalendarModel.availabilityData && typeof self.productCalendarModel.availabilityData.prices !== 'undefined') {
              var prices = self.productCalendarModel.availabilityData.prices;
              if (prices[dateStr] && self.productCalendarModel.availabilityData.occupation[dateStr].selectable_day) {
                var priceValue = new Number(prices[dateStr]);
                var priceStr = self.productCalendarModel.configuration.formatCurrency(prices[dateStr],
                                                                         self.productCalendarModel.configuration.currencySymbol,
                                                                         0,
                                                                         self.productCalendarModel.configuration.currencyThousandsSeparator,
                                                                         self.productCalendarModel.configuration.currencyDecimalMark,
                                                                         self.productCalendarModel.configuration.currencySymbolPosition);
                priceStr = priceStr.replace(' ', '');
                renderPrice = "<div class=\"mybooking-product_calendar-price\">"+priceStr+"</div>";
              }
            }
            // Min days
            if (self.productCalendarModel.availabilityData && typeof self.productCalendarModel.availabilityData.min_days !== 'undefined') {
              var minDays = self.productCalendarModel.availabilityData.min_days;
              if (minDays[dateStr] && minDays[dateStr] > 1 && self.productCalendarModel.availabilityData.occupation[dateStr].selectable_day) {
                minDaysLiteral = self.productCalendarModel.i18next.t('calendar_selector.min_duration', {days: minDays[dateStr]});
                renderMinDays = "<div class=\"mybooking-product_calendar-mindays mybooking-product_calendar-mindays-data\">"+minDaysLiteral+"</div>";
              }
            }
            // Check hourly occupation
            if (self.productCalendarModel.checkHourlyOccupation) {
              if (self.productCalendarModel.availabilityData && self.productCalendarModel.availabilityData['occupation'][dateStr] && 
                  self.productCalendarModel.availabilityData['occupation'][dateStr].selectable_day &&
                  self.productCalendarModel.availabilityData['occupation'][dateStr].warning_occupied) {
                renderCheckHourlyOccupation = "<div class=\"mybooking-product_calendar-check-hourly-container\">"+
                                            "<button class=\"mb-button mybooking-product_calendar-check-hourly\" data-date=\""+
                                            dateStr+"\" type=\"button\"><span class='dashicons dashicons-clock'></span></button></div>";
              }
              else {
                renderCheckHourlyOccupation = "<div class=\"mybooking-product_calendar-check-hourly-container\">&nbsp;</div>";
              }
            }

            // Return the date and extras
            return '<div class=\"mybooking-product_calendar-date\"><span>'+date+'</span>'+
                   renderPrice + renderMinDays + renderCheckHourlyOccupation;
                   '</div>';
          },
          hoveringTooltip: false         
      })
      .bind('datepicker-first-date-selected', function(event, obj){
        var dateStr = moment(obj.date1).format('YYYY-MM-DD');
        // Check that the day can not start if not available delivery hours
        if (typeof self.productCalendarModel.availabilityData.occupation[dateStr]['during_the_day_periods'] !== 'undefined' &&
            self.productCalendarModel.availabilityData.occupation[dateStr]['during_the_day_periods'].length > 0 && 
            typeof self.productCalendarModel.availabilityData.occupation[dateStr]['partial_delivery'] !== 'undefined') {
          if (self.productCalendarModel.availabilityData.occupation[dateStr]['partial_delivery'].length == 0) {
            event.stopPropagation();
            // Clear the selection
            $(self.productCalendarModel.dateSelector).data('dateRangePicker').clear();
            // Shows an message
            alert(self.productCalendarModel.i18next.t('calendar_selector.delivery_not_allowed'));
            return;
          }
        }
        // Check that the day can not start if not selectable (holidays)
        if (!self.productCalendarModel.availabilityData.occupation[dateStr].selectable_day) {
            event.stopPropagation();
            // Clear the selection
            $(self.productCalendarModel.dateSelector).data('dateRangePicker').clear();
            // Shows an message
            alert(self.productCalendarModel.i18next.t('calendar_selector.no_deliveries_collection'));
            return;          
        }
        self.productCalendarController.firstDateSelected(obj.date1);
      })
      .bind('datepicker-change',function(event,obj) {
        // Avoid trigger the event while updating calendar data
        if (!self.productCalendarModel.updatingData) {
          self.productCalendarController.datesChanged(obj.date1, obj.date2 || obj.date1);
        }
      });
      // Avoid Google Automatic Translation
      $('#date-container').addClass('notranslate');
      // Bind navigation events
      $('#date-container .next').on('click', function(){
        self.productCalendarController.monthChanged();
      });
      $('#date-container .prev').on('click', function(){
        self.productCalendarController.monthChanged();
      });

      setTimeout(function(){
        var width = $('#date-container').width();
        $('.date-picker-wrapper').css('width', '100%');
        $('.month-wrapper').css('width', 'inherit');
        $('.month-wrapper table').css('width', 'inherit');
        $('.month-wrapper table th').css('width', width/7+'px');
      }, 100);
      

    }

    /**
     * Update data
     */  
    this.update = function(availabilityData, durationScope) {

      this.productCalendarModel.updatingData = true;

      // Hold the availability data
      this.productCalendarModel.availabilityData = availabilityData;

      // Setup the first available date
      if (this.productCalendarModel.availabilityData && 
          typeof this.productCalendarModel.availabilityData.first_day !== 'undefined' && 
          this.productCalendarModel.availabilityData.first_day) {
        var firstDay = moment(this.productCalendarModel.availabilityData.first_day);
        var firstMonth = moment($(this.productCalendarModel.dateSelector).data('dateRangePicker').opt.month1);
        if (firstMonth.isBefore(firstDay)) {
          // This selects the first day
          $(this.productCalendarModel.dateSelector).data('dateRangePicker').setStart(this.productCalendarModel.availabilityData.first_day);
          // This clear the selection (but holds the month on screen)
          $(this.productCalendarModel.dateSelector).data('dateRangePicker').clear();
        }
      }

      if (durationScope != this.productCalendarModel.durationScope) {
        this.setDurationScope(durationScope);
      }
      else {
        // Redraw the calendar
        this.redraw();
      }

      this.productCalendarModel.updatingData = false;

    },

    /**
     * Change the duration Scope
     */ 
    this.setDurationScope = function(durationScope) {

      // Clear current selection
      this.productCalendarModel.selectedDateFrom = null;
      this.productCalendarModel.selectedDateTo = null;
      $(this.productCalendarModel.dateSelector).data('dateRangePicker').clear();

      // Setup duration scope
      this.productCalendarModel.durationScope = durationScope;

      // Setup singleDate
      if (durationScope === 'in_one_day') { 
        $(this.productCalendarModel.dateSelector).data('dateRangePicker').opt.singleDate = true;
      }
      else if (durationScope === 'days') {
        $(this.productCalendarModel.dateSelector).data('dateRangePicker').opt.singleDate = false;
      }

      // Force redraw
      this.redraw();

    }

    /**
     * Redraw the calendar
     */ 
    this.redraw = function() {

      // Redraw the calendar
      $(this.productCalendarModel.dateSelector).data('dateRangePicker').redraw();
      
      // Activate the control
      $('#date-container').removeClass('disabled-picker');

      // Setup check hourly
      if (this.productCalendarModel.checkHourlyOccupation) {
        var self = this;
        $('button.mybooking-product_calendar-check-hourly').off('click');
        $('button.mybooking-product_calendar-check-hourly').on('click', function(event){
          // Avoid the event to propagate and select the date
          event.stopPropagation();
          // Process the button click to show the occupation
          self.productCalendarController.checkHourlyOccupationButtonClick($(this).attr('data-date'));
        });
      }     

    }


  }

  var ProductCalendar = function() {
    this.model = new ProductCalendarModel();
    this.controller = new ProductCalendarController();
    this.view = new ProductCalendarView(this.model, this.controller);

    this.controller.setProductCalendarView(this.view);
    this.controller.setProductCalendarModel(this.model);
    this.model.setProductCalendarView(this.view);

    /**
     * Current Calendar Dates
     */ 
    this.currentCalendarDates = function() {
      return this.view.currentCalendarDates();
    }

    /**
     * Enable
     */ 
    this.enable = function() {

       if ($(this.model.dateSelector).attr('disabled')) {
         $(this.model.dateSelector).attr('disabled', false);
       }

    }

    /**
     * Clear
     */  
    this.clear = function() {
      $(this.model.dateSelector).data('dateRangePicker').clear();
    }

    this.redraw = function() {
      $(this.model.dateSelector).data('dateRangePicker').redraw();
    }

    /**
     * Destroy
     */  
    this.destroy = function() {
      $(this.model.dateSelector).data('dateRangePicker').destroy();
    }

  }

  return ProductCalendar;


});