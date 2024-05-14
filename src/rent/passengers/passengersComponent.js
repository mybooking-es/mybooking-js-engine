// eslint-disable-next-line no-undef
define('passengersComponent', [
  'jquery',
  'commonServices',
  'commonSettings',
  'commonTranslations',
  'commonLoader',
  'ysdtemplate',
  'i18next',
], function(
  $,
  commonServices,
  commonSettings,
  commonTranslations,
  commonLoader,
  tmpl,
  i18next,
) {
  const model = {
    requestLanguage: null,
    booking: null,
    configuration: null,

    /**
     * Get passengers list
     */ 
    getPassengers: function() {
      // Show the loader
      commonLoader.show(); 

      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id;

      const urlParams = [];
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

            const passengersListContent = $('#passengers_list__content');
            if (passengersListContent.length > 0) {
              // Clear the list
              $('#passengers_list #passengers_list__not_data').hide();
              passengersListContent.html('');

            // Get the table item container
              if (total > 0 && document.getElementById('script_passengers_list__item')) {
                // Add the items
                data.forEach((passenger, index) => {
                  const passengersItemTmpl = tmpl('script_passengers_list__item')(
                    {
                      passenger, index: index + 1
                    }
                  );
                  passengersListContent.append(passengersItemTmpl);
                });
                } else {
                  // Show no data message
                  $('#passengers_list #passengers_list__not_data').show();
                }
            }
          },
          error: function() {
            // Show the error message
            alert(i18next.t('myReservation.passenger.listed.error'));
          },
          complete: function() {
            // Hide the loader
            commonLoader.hide(); 
          }
      });
    },

    /**
     * Add passenger to list
     */ 
    addAPassenger: function(data) {
      // Show the loader
      commonLoader.show(); 

      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id + '/passenger';

      const urlParams = [];
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
            // Show the success message
            alert(i18next.t('myReservation.passenger.added.success'));
            controller.refresh();
          },
          error: function() {
            // Show the error message
            alert(i18next.t('myReservation.passenger.added.error'));
          },
          complete: function() {
            // Hide the loader
            commonLoader.hide(); 
          }
      });
    },

    /**
     * Remove passenger from list
     */ 
    removeAPassenger: function(id) {
      // Show the loader
      commonLoader.show(); 

      // Build the URL
      let url = commonServices.URL_PREFIX + '/api/booking/frontend/passengers/' +
      this.booking.free_access_id + '/passenger/' + id;

      const urlParams = [];
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
            // Show the success message
            alert(i18next.t('myReservation.passenger.remove.success'));
            controller.refresh('table');
          },
          error: function() {
            // Show the error message
            alert(i18next.t('myReservation.passenger.remove.error'));
          },
          complete: function() {
            // Hide the loader
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
      // If the form is valid  add the passenger
      if (form.valid()) {
        // Format the data
        const formdata = form.formParams(false);
        const formdataFormated = Object.fromEntries(
          Object.entries(formdata).map(([key, value]) => 
            [key.replace('passenger_', ''), value]
          )
        );

        // Stringify the data
        const data = JSON.stringify(formdataFormated);

        // Add the passenger
        model.addAPassenger(data);
      }
    },

    /**
     * Remove passenger from list
     */ 
    removeAPassenger: function(event) {
      event.preventDefault();
    
      // Get the passenger id and name
      const id = $(event.currentTarget).attr('data-id');
      const name = $(event.currentTarget).attr('data-name');

      // If the id is valid, show the confirmation message
      if (id && id.trim() !== '') {
        const confirmationMessage = i18next.t('myReservation.passenger.remove.warning') + ' ' + name;

        // If the user confirms, remove the passenger
        if (confirm(confirmationMessage)) {
          model.removeAPassenger(id);
        }
      }
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
		init: function({booking, configuration}) {
      // Initialize i18next for translations
      model.requestLanguage = commonSettings.language(document.documentElement.lang);
      i18next.init({  
        lng: model.requestLanguage,
        resources: commonTranslations
      }, 
      function() {
      });

      // Set the model
      model.booking = booking;
      // Set the configuration
      model.configuration = configuration;

      // Add the templates
      this.addTemplates();
		},

    /**
     * Add HTML templates
     */ 
    addTemplates: function() {
      // Add the passengers table template
      if (document.getElementById('script_passengers_table')) {
        const passengersTableTmpl = tmpl('script_passengers_table')(
          {
            booking: model.booking,
            configuration: model.configuration,
          });
        $('#passengers_table_container').html(passengersTableTmpl);
        $('#passengers_container').show();
      }
      // Add the passengers form template
      if (document.getElementById('script_passengers_form')) {
        const passengersFormTmpl = tmpl('script_passengers_form')(
            {booking: model.booking,
              configuration: model.configuration});
        $('#passengers_form_container').html(passengersFormTmpl);
        $('#passengers_container').show();
      }

      // Setups
      // this.setupControls();
			this.setupEvents();
      this.setupValidate();
      this.refreshTable();
    },

    /**
     * Setup UI Controls
     */ 
		setupControls: function() {
		},

    /**
     * Setup Events
     */ 
		setupEvents: function() {
			// Add a passenger button event
      const btnAddPassenger = $('#btn_add_passenger');
      if (btnAddPassenger.length > 0) {
        btnAddPassenger.off('click', controller.addAPassenger);
        btnAddPassenger.on('click', controller.addAPassenger);
      }

      // Delete a passenger button event
      const passengersTableContainer = $('#passengers_table_container');
      if (passengersTableContainer.length > 0) {
        passengersTableContainer.off('click', '.btn_remove_passenger');
        passengersTableContainer.on('click', '.btn_remove_passenger', controller.removeAPassenger);
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
      // Reset the form
      document.getElementById('booking_passengers_form').reset();
    },

    setupValidate: function() {
      // Add the validation messages
      $.extend($.validator.messages, {
        required: i18next.t('myReservation.passenger.validations.fieldRequired')
      });

      // Add the validation rules
      $('form[name=booking_passengers_form]').validate(
          {
            submitHandler: function(form) {
              return false;
            },
            invalidHandler : function(form, validator) {
              $('#passengers_error').html(i18next.t('myReservation.passenger.validations.invalid')).show();
            },
            rules : {
              passenger_name: 'required',
              passenger_surname: 'required',
              passenger_document_id: 'required',
            },
              messages : {
                passenger_name: i18next.t('myReservation.passenger.validations.fieldRequired'),
                passenger_surname: i18next.t('myReservation.passenger.validations.fieldRequired'),
                passenger_document_id: i18next.t('myReservation.passenger.validations.fieldRequired'),
              },
              errorClass : 'form-reservation-error'
          }
      );
    },
	};

  const passengersComponent = {
    model,
    controller,
    view,
  };

  return passengersComponent;
});
