define('ActivityCyclic', ['jquery','ysdtemplate', 'YSDRemoteDataSource','YSDSelectSelector', 
                          'commonServices', 'commonSettings', 'commonTranslations', 'moment','i18next',
                          'jquery.ui', 
                          'jquery.ui.datepicker-es', 'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
                          'jquery.ui.datepicker.validation', 'jquery.validate', 'jquery.i18next'],
    function($,  tmpl, RemoteDataSource, SelectSelector, commonServices, commonSettings, 
             commonTranslations, moment, i18next) {

        var activityCyclicModel = { // THE activityCyclicModel

            requestLanguage: null,
            configuration: null,
            activity: null,
            year: null,
            month: null,
            tickets: null,
            buyTickets: null,
            performances: null,
            calendarBuilt: false,
            cyclicDate: null,
            cyclicTurns: null,
            cyclicTurn: null,

            // ----------- API


            loadPerformances: function() { /* Load the activity performances */
                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/' + activityCyclicModel.activity.id +
                          '/performances';
                url += '?year='+this.year+'&month='+this.month;
                if (activityCyclicModel.requestLanguage != null) {
                  url += '&lang='+activityCyclicModel.requestLanguage;
                }
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  url += '&api_key='+commonServices.apiKey;
                }       
                // Get the firstday
                url += "&firstday=true"; 

                $.ajax({
                    type: 'GET',
                    url: url,
                    async: false,
                    contentType: 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function (data, textStatus, jqXHR) {
                        activityCyclicModel.performances = data;
                        if (!activityCyclicModel.calendarBuilt) {
                            activityCyclicView.updateCalendar();
                            activityCyclicModel.calendarBuilt = true;
                        }
                        else {
                            $("#datepicker").datepicker('refresh');
                        }
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {                  
                    }

                });            
            },   

            loadTurns: function() { /* Load the turns*/

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/'+activityCyclicModel.activity.id+'/turns';
                url += '?date='+this.cyclicDate;
                // Language
                if (activityCyclicModel.requestLanguage != null) {
                    url += '&lang='+activityCyclicModel.requestLanguage;
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  url += '&api_key='+commonServices.apiKey;
                }                  
                $.ajax({
                    type: 'GET',
                    url: url,
                    async: false,
                    contentType: 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function (data, textStatus, jqXHR) {
                        activityCyclicModel.cyclicTurns = data;
                        activityCyclicView.updateActivityCyclicTurns();
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {                  
                    }

                });                  

            },

            loadTickets: function() { /* Load the available tickets */

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/activities/' + this.activity.id + '/tickets';
                url += '?date='+this.cyclicDate+'&turn='+this.cyclicTurn;
                // Language
                if (activityCyclicModel.requestLanguage != null) {
                    url += '&lang='+activityCyclicModel.requestLanguage;
                }
                // Api Key
                if (commonServices.apiKey && commonServices.apiKey != '') {
                  url += '&api_key='+commonServices.apiKey;
                }  

                $.ajax({
                    type: 'GET',
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function (data, textStatus, jqXHR) {
                        activityCyclicModel.tickets = data;
                        activityCyclicView.updateTickets();
                    },
                    error: function (data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorLoadingData'));
                    },
                    complete: function (jqXHR, textStatus) {
                    }
                });


            },

            putShoppingCartFreeAccessId: function(value) {
              sessionStorage.setItem('activities_shopping_cart_free_access_id', value);
            },

            getShoppingCartFreeAccessId: function() {
              return sessionStorage.getItem('activities_shopping_cart_free_access_id');
            },

            addToShoppingCart: function() {

                var request = {
                        id: this.activity.id,
                        date: this.cyclicDate,
                        turn: this.cyclicTurn,
                        tickets: this.buyTickets
                    };

                var requestJSON = encodeURIComponent(JSON.stringify(request));

                var url = commonServices.URL_PREFIX + '/api/booking-activities/frontend/add-to-shopping-cart';
                
                var freeAccessId = this.getShoppingCartFreeAccessId();
                if (freeAccessId) {
                  url += '/' + freeAccessId;
                }
                // == Url params
                var urlParams = null;
                // Language
                if (activityCyclicModel.requestLanguage != null) {
                   urlParams = '?lang='+activityCyclicModel.requestLanguage;
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
                $.ajax({
                    type: 'POST',
                    url : url,
                    data: requestJSON,
                    dataType : 'json',
                    contentType : 'application/json; charset=utf-8',
                    crossDomain: true,
                    success: function(data, textStatus, jqXHR) {

                         // Store the shopping cart free access id in the session
                         var free_access_id = activityCyclicModel.getShoppingCartFreeAccessId();
                         if (free_access_id == null || free_access_id != data.free_access_id) {
                           activityCyclicModel.putShoppingCartFreeAccessId(data.free_access_id);
                         }

                         window.location.href = commonServices.shoppingCartUrl; 
                    },
                    error: function(data, textStatus, jqXHR) {
                        alert(i18next.t('activities.common.errorUpdatingData'));
                    },
                    complete: function(jqXHR, textStatus) {

                    }

                });

            }
            
        };

        var activityCyclicController = { // THE activityCyclicController

            onCyclicDateChanged: function() { /* Cyclic activity date changed */
              activityCyclicModel.cyclicDate = $('#datepicker').val(); // String representation of the date (format dd/MM/yyyy)
              activityCyclicModel.loadTurns();
            },

            onCyclicTurnChanged: function() { /* Cyclic activity turn changed */
              activityCyclicModel.cyclicTurn = $('input[name=turn]:checked').val();
              activityCyclicModel.loadTickets();
            },

            onBtnReservationClick: function() { /* Button reservation click */

              var selectedTickets = false;
              activityCyclicModel.buyTickets = {};

              if ( $('select[name=selected_tickets_full_mode]').length > 0 ) {
                var rate = $('select[name=selected_tickets_full_mode]').val();
                var value = (rate == '' ? 0 : 1);
                if (value > 0) {
                  selectedTickets = true;
                  activityCyclicModel.buyTickets[rate] = value;
                }
              }
              else {
                var quantityRate = $('select.quantity_rate, input[type=hidden].quantity_rate');
                for (var idx=0; idx<quantityRate.length; idx++) {
                   var rate = parseInt($(quantityRate[idx]).attr('name').replace('quantity_rate_',''));
                   var value = parseInt($(quantityRate[idx]).val());
                   if (value > 0) {
                       selectedTickets = true;
                       activityCyclicModel.buyTickets[rate] = value;
                   }
                }
              }

              if (!selectedTickets) {
                  alert(i18next.t('activities.calendarWidget.selectTickets'));
              }
              else {
                  activityCyclicModel.addToShoppingCart();
              }

            }


        };


        var activityCyclicView = { // THE activityCyclicView

            init: function() {

                activityCyclicModel.requestLanguage = commonSettings.language(document.documentElement.lang);
                // Initialize i18next for translations
                i18next.init({  
                                lng: activityCyclicModel.requestLanguage,
                                resources: commonTranslations
                             }, 
                             function (error, t) {
                                // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                                //jqueryI18next.init(i18next, $);
                                // Localize UI
                                //$('.nav').localize();
                             });
                activityCyclicModel.loadPerformances();

            },

            updateCalendar: function() {

                // Builds the calendar
                var result = tmpl('script_cyclic_calendar')({activity_id: activityCyclicModel.activity.id});
                $('#buy_selector').html(result);
                $.datepicker.setDefaults( $.datepicker.regional[activityCyclicModel.requestLanguage] );
                $.datepicker.regional[activityCyclicModel.requestLanguage].dateFormat = 'dd/mm/yy';  

                var minDate = moment().format('DD/MM/YYYY');
                if (activityCyclicModel.performances && typeof activityCyclicModel.performances.first_day !== 'undefined') {
                  minDate = moment(activityCyclicModel.performances.first_day).format('DD/MM/YYYY');
                }

                $("#datepicker").datepicker({
                    minDate: minDate,
                    dateFormat: 'dd/mm/yy',
                    beforeShowDay: function(date) {
                       var dateStr = moment(date).format('YYYY-MM-DD');
                       if (typeof activityCyclicModel.performances[dateStr] !== 'undefined') {
                         if (activityCyclicModel.performances[dateStr] == 1) {
                            return [true]; // Date selectable
                         }
                         else if (activityCyclicModel.performances[dateStr] == 2) {
                            return [true, 'bg-warning text-warning']; // Warning places
                         }
                         else if (activityCyclicModel.performances[dateStr] == 0) {   
                            return [false, 'bg-danger text-danger']; // No places
                         }
                         else if (activityCyclicModel.performances[dateStr] == 3) {
                            return [false]; // Not possible due to date
                         }
                       }
                       else {
                         return [false];
                       }
                    },
                    onChangeMonthYear: function(year, month, instance) {
                        console.log(year+'-'+month);
                        activityCyclicModel.year = year;
                        activityCyclicModel.month = month;
                        activityCyclicModel.loadPerformances();
                    }                    
                });   
                // Avoid Google Automatic Translation
                $('.ui-datepicker').addClass('notranslate');                
                $('#datepicker').datepicker('option', 'dateFormat', 'dd/mm/yy');
                $('#datepicker').bind('change', function() {
                    activityCyclicController.onCyclicDateChanged();
                }); 

            },

            updateActivityCyclicTurns: function() { /* Setup the turns */
                // Builds the turns
                var result = tmpl('script_cyclic_turns')({turns: activityCyclicModel.cyclicTurns, 
                                                          isEmptyTurns: $.isEmptyObject(activityCyclicModel.cyclicTurns)});
                $('#turns').html(result);

                $('input[name=turn]').bind('change', function() {
                    activityCyclicController.onCyclicTurnChanged();
                });

                $('#tickets').html('');

            },

            updateTickets: function() { /* Setup the tickets */

                // Builds the tickets
                if (activityCyclicModel.activity &&
                    activityCyclicModel.activity.allow_select_places_for_reservation) {
                  var result = tmpl('script_tickets')({tickets: activityCyclicModel.tickets});
                }
                else {
                  var result = tmpl('script_fixed_ticket')({tickets: activityCyclicModel.tickets});
                }

                $('#tickets').html(result);
                $('#btn_reservation').bind('click', function(){
                   activityCyclicController.onBtnReservationClick();
                });
            }



        };

        return function ActivityCyclic(activity, configuration, month, year) {

          this.model = activityCyclicModel;
          this.controller = activityCyclicController;
          this.view = activityCyclicView;

          this.model.activity = activity;
          this.model.configuration = configuration;
          this.model.month = month;
          this.model.year = year;

        };


    });
