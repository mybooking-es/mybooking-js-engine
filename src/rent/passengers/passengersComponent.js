// eslint-disable-next-line no-undef
define('passengersComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
	// 'YSDDateControl',
], function (
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  tmpl,
  i18next,
	// DateControl
) {
  const model = {
    requestLanguage: null,
    booking: null,
    configuration: null,

    /**
     * Get passengers list
     */ 
    getPassengers: function() {
      commonLoader.show(); 

      // Build the URL
      var url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id;

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
          success: function(result) {
            const {
              data,
              total
            } = result;

            $('#passengers_list #passengers_list__not_data').hide();
            $('#passengers_list__content').html('');

            if (total > 0) {
              if (document.getElementById('script_passengers_list__item')) {
                data.forEach((passenger, index) => {
                  const passengersItem = tmpl('script_passengers_list__item')(
                    { passenger, index: index + 1 });
                  $('#passengers_list__content').append(passengersItem);
                });
              }
            } else {
              $('#passengers_list #passengers_list__not_data').show();
            }
          },
          error: function() {
            alert(i18next.t('myReservation.passenger.listed.error'));
          },
          complete: function() {
            commonLoader.hide(); 
          }
      });
    },

    /**
     * Add passenger to list
     */ 
    addAPassenger: function(data) {
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id + '/passenger';

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
          type: 'POST',
          url : url,
          dataType : 'json',
          data,
          contentType : 'application/json; charset=utf-8',
          crossDomain: true,
          success: function() {
            alert(i18next.t('myReservation.passenger.added.success'));
            controller.refresh();
          },
          error: function() {
            alert(i18next.t('myReservation.passenger.added.error'));
          },
          complete: function() {
            commonLoader.hide(); 
          }
      });
    },

    /**
     * Remove passenger from list
     */ 
    removeAPassenger: function(id) {
      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id + '/passenger/' + id;

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
          type: 'DELETE',
          url : url,
          crossDomain: true,
          success: function() {
            alert(i18next.t('myReservation.passenger.remove.success'));
            controller.refresh('table');
          },
          error: function() {
            alert(i18next.t('myReservation.passenger.remove.error'));
          },
          complete: function() {
            commonLoader.hide(); 
          }
      });
    }
	};

  const controller = {
    /**
     * Get passengers list
     */ 
    getPassengers: function() {
      model.getPassengers();
    },

		/**
     * Add passenger to list
     */ 
    addAPassenger: function(event) {
      event.preventDefault();

      const form = $('form[name=booking_passengers_form]');
      if ( form.valid() ) {
        const formdata = form.formParams(false);
        const formdataFormated = Object.fromEntries(
          Object.entries(formdata).map(([key, value]) => 
            [key.replace('passenger_', ''), value]
          )
        );
        const data = JSON.stringify(formdataFormated);

        model.addAPassenger(data);
      }
    },

    /**
     * Remove passenger from list
     */ 
    removeAPassenger: function(event) {
      event.preventDefault();

      const id = $(event.currentTarget).attr('data-id');
      model.removeAPassenger(id);
    },

    /**
     * Refresh UI
     */
    refresh: function(viewType) {
      switch (viewType) {
        case 'table':
          view.refreshTable();
          break;
        case 'form':
          view.clearForm();
          break;
        default:
          view.refreshTable();
          view.clearForm();
          break;
      }
    }
	};

  const view = {
    /**
     * Initialize
     */ 
		init: function({ booking, configuration }) {
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function () {
      });

      model.booking = booking;
      model.configuration = configuration;

      this.addTemplates();
		},

    /**
     * Add html templates
     */ 
    addTemplates: function() {
      if (document.getElementById('script_passengers_table')) {
        var passengersTable = tmpl('script_passengers_table')(
            {booking: model.booking,
              configuration: model.configuration});
        $('#passengers_table_container').html(passengersTable);
      }
      if (document.getElementById('script_passengers_form')) {
        var passengersForm = tmpl('script_passengers_form')(
            {booking: model.booking,
              configuration: model.configuration});
        $('#passengers_form_container').html(passengersForm);
      }
      if (document.getElementById('script_passengers_table') || document.getElementById('script_passengers_form')) {
        $('#passengers_container').show();
      }

      this.setupControls();
			this.setupEvents();
      this.refreshTable();
    },

    /**
     * Setup UI Controls
     */ 
		setupControls: function() {
			// // Configure passenger document id date
			// if (document.getElementById('passenger_document_id_date_day')) {
      //   var dateControl = new DateControl(document.getElementById('passenger_document_id_date_day'),
      //                   document.getElementById('passenger_document_id_date_month'),
      //                   document.getElementById('passenger_document_id_date_year'),
      //                   document.getElementById('passenger_document_id_date'),
      //                   commonSettings.language(model.requestLanguage));
      //   if (model.booking && model.booking.passenger_document_id_date) {
      //     dateControl.setDate(model.booking.passenger_document_id_date);
      //   }
      // }
		},

    /**
     * Setup Events
     */ 
		setupEvents: function() {
			// Add a passenger button
      if ($('#btn_add_passenger').length) {
        $('#btn_add_passenger').on('click', controller.addAPassenger);
      }

      // Delete a passenger button
      if ($('#passengers_table_container').length) {
        $('#passengers_table_container').on('click', '#btn_remove_passenger', controller.removeAPassenger);
      }
		},

    /**
     * Refresh table
     */ 
    refreshTable: function() {
      // Get passenger list
      controller.getPassengers();
    },

    /**
     * Clear form
     */ 
    clearForm: function() {
      document.getElementById('booking_passengers_form').reset();
    }
	};

  const passengersComponent = {
    model,
    controller,
    view,
  };

  return passengersComponent;
});
