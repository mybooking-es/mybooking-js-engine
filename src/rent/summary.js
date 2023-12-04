require(['jquery', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         './mediator/rentEngineMediator', 
         'i18next','ysdtemplate', 'YSDDateControl', 'moment',
         'jquery.i18next',   
         'jquery.validate', 'jquery.ui', 'jquery.form'],
    function($, RemoteDataSource, SelectSelector,
             commonServices, commonSettings, commonTranslations, commonLoader, rentEngineMediator, 
             i18next, tmpl, DateControl, moment) {

  var model = { // THE MODEL
    requestLanguage: null,
    configuration: null,        
    bookingFreeAccessId : null,
    booking: null,
    sales_process: null,

    // -------------- Load settings ----------------------------

    loadSettings: function() {
      commonSettings.loadSettings(function(data){
        model.configuration = data;
        view.init();
      });
    },  

    // ------------ Product information detail ------------------------

    getUrlVars : function() {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    },

    extractVariables: function() { // Load variables from the request

      var url_vars = this.getUrlVars();
      this.bookingFreeAccessId = decodeURIComponent(url_vars['id']);

    },

    // ----------------- Reservation ------------------------------

    getBookingFreeAccessId: function() { /* Get the booking id */
      return sessionStorage.getItem('booking_free_access_id');
    },

    setBookingFreeAccessId: function(bookingFreeAccessId) { /* Set the booking id */
      sessionStorage.setItem('booking_free_access_id', bookingFreeAccessId);
    },

    loadBooking: function() { /** Load the reservation **/

       var bookingId = this.bookingFreeAccessId;

       if (bookingId == '') {
         bookingId = this.getBookingFreeAccessId();
       }

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking/frontend/booking/' +
                 bookingId;
       var urlParams = [];
       if (this.requestLanguage != null) {
         urlParams.push('lang=' + this.requestLanguage);
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
               url : url,
               dataType : 'json',
               contentType : 'application/json; charset=utf-8',
               crossDomain: true,
               success: function(data, textStatus, jqXHR) {
                 model.booking = data.booking;
                 model.bookingFreeAccessId = data.booking.free_access_id;
                 model.sales_process = data.sales_process;
                 view.updateBooking();
               },
               error: function(data, textStatus, jqXHR) {
                 commonLoader.hide();
                 alert(i18next.t('summary.loadReservation.error'));
               },
               complete: function(jqXHR, textStatus) {
                 $('#content').show();
                 $('#sidebar').show();
               }
          });
    }

  };

  var controller = { // THE CONTROLLER
    btnPaymentClick: function(paymentMethod) {
       model.sendPayRequest();
    },
    btnUpdateClick: function() {
       model.update();
    }
  };

  var view = { // THE VIEW

    init: function() {
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: model.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                      // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                      //jqueryI18next.init(i18next, $);
                      // Localize UI
                      //$('.nav').localize();
                   });      
      // Setup UI          
      model.extractVariables();
      model.loadBooking();
    },

    updateBooking: function() { // Updates the reservation

      this.updateTitle();
      this.updateBookingSummary();
      commonLoader.hide();

      // Mediator update booking
      rentEngineMediator.onSummaryUpdateBooking(model.booking);

    },

    updateTitle: function() {
      $('#reservation_title').html(model.booking.summary_status);
    },

    updateBookingSummary: function() { // Updates the shopping cart summary (total)
      var reservationDetail = tmpl('script_reservation_summary')(
          {
            booking: model.booking,
            configuration: model.configuration
          });
      $('#reservation_detail').html(reservationDetail);

      if ( model.configuration.multipleProductsSelection && document.getElementById('script_mybooking_summary_product_detail_table')) {
        var reservationTableDetail = tmpl('script_mybooking_summary_product_detail_table')({
          bookings: model.booking.booking_lines,
          configuration: model.configuration
        });
        $('#mybooking_summary_product_detail_table').html(reservationTableDetail);
      }
    }
  };


  var rentSummary = {
    model: model,
    controller: controller,
    view: view
  }
  rentEngineMediator.setSummary( rentSummary );

  // The loader is show on start and hidden after the reservation
  // has been rendered
  commonLoader.show();

  // Load settings
  model.loadSettings();

});
