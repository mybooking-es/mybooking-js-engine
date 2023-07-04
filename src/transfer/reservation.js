require(['jquery', 'YSDRemoteDataSource','YSDSelectSelector',
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         './mediator/transferEngineMediator', 
         'i18next','ysdtemplate', 'YSDDateControl', 'moment',
         'jquery.i18next',   
         'jquery.validate', 'jquery.ui', 'jquery.form'],
    function($, RemoteDataSource, SelectSelector,
             commonServices, commonSettings, commonTranslations, commonLoader, transferEngineMediator, 
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
      return sessionStorage.getItem('transfer_booking_free_access_id');
    },

    setBookingFreeAccessId: function(bookingFreeAccessId) { /* Set the booking id */
      sessionStorage.setItem('transfer_booking_free_access_id', bookingFreeAccessId);
    },

    loadTransferBooking: function() { /** Load the reservation **/

       var bookingId = this.bookingFreeAccessId;

       if (bookingId == '') {
         bookingId = this.getBookingFreeAccessId();
       }

       // Build the URL
       var url = commonServices.URL_PREFIX + '/api/booking-transfer/frontend/reservation/' +
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
    },

    sendPayRequest: function() {
      var bookingId = this.bookingFreeAccessId;
      if (bookingId == '') {
        bookingId = this.getBookingFreeAccessId();
      }
      else {
        this.setBookingFreeAccessId(bookingId);
      }
      var data = $('form[name=payment_form]').formParams();
      data['id'] = bookingId;
      // Do payment
      view.payment( commonServices.URL_PREFIX + '/reserva-transfer/pagar', data );
    },


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
      model.loadTransferBooking();
    },

    updateBooking: function() { // Updates the reservation

      this.updateTitle();
      this.updateBookingSummary();
      commonLoader.hide();

    },

    updateTitle: function() {
      $('#mybooking_transfer_reservation_title').html(model.booking.summary_status);
    },

    updateBookingSummary: function() { // Updates the booking summary (total)

       // Reservation summary
       var reservationDetail = tmpl('script_transfer_reservation_summary')(
            {booking: model.booking,
             configuration: model.configuration});
       $('#mybooking_transfer_reservation_detail').html(reservationDetail);

       // Payment
       if (document.getElementById('script_transfer_payment_detail')) {
         // If the booking is pending show the payment controls
         if (model.sales_process.can_pay) {
           var amount = 0;
           if (model.sales_process.can_pay_pending) {
             amount = model.booking.total_pending;
           }
           else if (model.sales_process.can_pay_deposit) {
             amount = model.booking.booking_amount;
           }
           else if (model.sales_process.can_pay_total) {
             amount = model.booking.total_cost;
           }
           var paymentInfo = tmpl('script_transfer_payment_detail')(
            {
              sales_process: model.sales_process,
              amount: amount,
              booking: model.booking,
              configuration: model.configuration,
              i18next: i18next            
            });
           $('#transfer_payment_detail').html(paymentInfo);
           this.setupPaymentFormValidation();
           $('#transfer_payment_detail').show();
         }
       }

    },

    setupPaymentFormValidation: function() {

        $('form[name=payment_form]').validate(
            {
                submitHandler: function(form) {
                    controller.btnPaymentClick();
                    return false;
                },
                rules : {
                    'payment_method_id': 'required',
                },
                messages: {
                    'payment_method_id': i18next.t('myReservation.pay.paymentMethodRequired'),
                },
                errorPlacement : function(error, element) {
                  if (element.attr('name') == 'payment_method_id')  {
                    error.insertBefore('#btn_pay');
                  }
                  else {
                     error.insertAfter(element);
                  }
                },
                errorClass : 'form-reservation-error',
            }
        );

    },

    /**
     * Payment
     */
    payment: function(url, paymentData) {

      transferEngineMediator.onExistingReservationPayment(url, paymentData);

    },
    
    /*
     * Go to the payment
     */
    gotoPayment: function(url, paymentData) {

      $.form(url, paymentData,'POST').submit();

    }

  };


  var rentMyReservation = {
    model: model,
    controller: controller,
    view: view
  }
  transferEngineMediator.setMyReservation( rentMyReservation );

  // The loader is show on start and hidden after the reservation
  // has been rendered
  commonLoader.show();

  // Load settings
  model.loadSettings();

});
