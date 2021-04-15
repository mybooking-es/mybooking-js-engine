require(['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',  
         'i18next', 'ysdtemplate', 'SignaturePad', 'jquery.i18next'],
    function($,
             commonServices, commonSettings, commonTranslations, commonLoader,
             i18next, tmpl, SignaturePad) {


      model = {

        requestLanguage: null,
        configuration: null,        
        bookingFreeAccessId : null,
        booking: null,

        // -------------- Load settings ----------------------------

        loadSettings: function() { // Load settings
          commonSettings.loadSettings(function(data){
            model.configuration = data;
            view.init();
          });
        },  

        extractVariables: function() { // Load variables from the request

          var url_vars = commonSettings.getUrlVars();
          this.bookingFreeAccessId = decodeURIComponent(url_vars['id']);

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
                     alert(i18next.t('myReservation.loadReservation.error'));
                   }
              });
        },

      };

      controller = {

      };

      view = {

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

          commonLoader.hide();

        }

      };

    // The loader is show on start and hidden after the reservation
    // has been rendered
    commonLoader.show();

    // Load settings
    model.loadSettings();

    }
);