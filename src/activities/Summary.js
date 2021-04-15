require(['jquery', 'i18next', 'ysdtemplate', 
        'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
        'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
        'jquery.ui.datepicker.validation','jquery.form'],
    function($, i18next, tmpl,
             commonServices, commonSettings, commonTranslations, commonLoader) {

        model = { // THE MODEL
            requestLanguage: null,
            configuration: null,
            orderFreeAccessId: null,
            order: null,
            sales_process: null,

            /**
             * Load settings
             */
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
              this.orderFreeAccessId = decodeURIComponent(url_vars['id']);

            },

            // ----------------- Reservation ------------------------------

            getOrderFreeAccessId: function() { /* Get the order id */
              return sessionStorage.getItem('order_free_access_id');
            },

            setOrderFreeAccessId: function(orderFreeAccessId) { /* Set the order id */
              sessionStorage.setItem('order_free_access_id', orderFreeAccessId);
            },

            /**
             * Load the reservation
             */
            loadOrder: function() { 

               var orderId = this.orderFreeAccessId;

               if (orderId == '') {
                 orderId = this.getOrderFreeAccessId();
               }

               // Build the URL
               var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/order/' + orderId;
               // == Url params
               var urlParams = null;
               // Language
               if (this.requestLanguage != null) {
                 urlParams = '?lang='+this.requestLanguage;
               }
               // Api Key
               if (commonServices.apiKey && commonServices.apiKey != '') {
                 if (urlParams == null) {
                   urlParams = '?';
                 }
                 else {
                   urlParams += '&';
                 }
                 urlParams += 'api_key='+commonServices.apiKey;
               } 
               if (urlParams != null) {
                  url += urlParams;
               }
               // == Ajax

               // Action to the URL
               $.ajax({
                       type: 'GET',
                       url : url,
                       dataType : 'json',
                       contentType : 'application/json; charset=utf-8',
                       crossDomain: true,
                       success: function(data, textStatus, jqXHR) {

                         if (model.requestLanguage != data.customer_language &&
                             data.customer_language != null &&
                             data.customer_language != '') {
                           window.location.href = data.customer_language + commonServices.orderUrl.startsWith('/') ? '' : '/' +
                                                  commonServices.orderUrl + '?id=' + data.free_access_id;
                         }
                         else {
                           model.order = data;
                           view.updateOrder();
                         }

                       },
                       error: function(data, textStatus, jqXHR) {

                         alert(i18next.t('activities.common.errorLoadingData'));

                       },
                       complete: function(jqXHR, textStatus) {
                         commonLoader.hide();
                         $('#content').show();
                         $('#sidebar').show();
                       }
                  });
            },

        };

        controller = { // THE CONTROLLER

        };

        view = { // THE VIEW

            init: function() {
                model.requestLanguage = commonSettings.language(document.documentElement.lang);                
                // Setup UI          
                model.extractVariables();
                commonLoader.show();
                model.loadOrder();
            },
            updateOrder: function() {

              var reservationInfo = tmpl('script_order')(
                  {order: model.order, 
                   configuration: model.configuration});
              $('#reservation_detail').html(reservationInfo);

            }

        };

        model.loadSettings();

    });