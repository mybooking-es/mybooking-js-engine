/******
 *
 * Renting Module ShiftPicker
 *
 */
require([
  'jquery',
  'i18next',
  'commonSettings',
	'commonServices',
  'commonLoader',
	'commonTranslations',
	'moment',
	'YSDFormatter',
	'jquery.i18next',
], function (
  $,
  i18next,
  commonSettings,
	commonServices,
  commonLoader,
  commonTranslations,
	moment,
	YSDFormatter,
) {
  /**
   * Contructor
   */
  function ShiftPicker({
		containerHTML,
		category_code,
		rental_location_code,
		units,
		date,
		turn,
  }) {

    /**
     * ShiftPicker data model
     */
    this.model = {
			containerHTML, // All html container instance
			requestLanguage: 'es', // Request language
			category_code, // Product code
			rental_location_code, // Rental location code
			api_date_format: 'YYYY-MM-DD', // Api date format for requests
			maxUnits: 1, // Max units in selector
			units, // Selected units
			dates: [], // All dates
			date, // Selected date
			turns: [], // All turns
			turn, // Selected turn
    };
  }

  /**
   * ========== The model (extended with API methods)
   */
  const model = {
		/**
	 	* Get category max units
	 	*/
		getMaxUnits: function() {
			const {
        category_code,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/products/${category_code}/inventory`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (result) {
            resolve(result.units);
          })
          .fail(function (error) {
            console.log('Error', error);
            
						alert('Se ha producido un error en las unidades'); // TODO

            resolve(1);
          });
      });
		},

		/**
	 	* Get dates
	 	*/
		getDates: function() {
			const {
        category_code,
				date,
				rental_location_code,
				api_date_format,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/dates`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

			// Dates
			urlParams.push('from=' + date);
			urlParams.push('to=' + YSDFormatter.formatDate(moment(date).add(7, 'days'), api_date_format));
			urlParams.push('product=' + category_code);

      if (urlParams.length > 0) {
        url += '?';
        url += urlParams.join('&');
      }

      // Returns a Promise with the response
      return new Promise((resolve) => {
        $.ajax({
          url: url,
        })
          .done(function (result) {
            resolve(result);
          })
          .fail(function (error) {
            console.log('Error', error);
            
						alert('Se ha producido un error en las fechas'); // TODO

            resolve(1);
          });
      });
		},

		/**
	 	* Get turns
	 	*/
		getTurns: function() {

		},
  };

  /***
   * =============== The controller
   */
  const controller = {
		/**
     * Initialize units selector
     */
    initializeUnitsSelector: async function() {
      commonLoader.show();

			const {
				containerHTML
			} = this.model;

			// Get max units for select field
			this.model.maxUnits =  await this.getMaxUnits();
			// Add options in select field
			const field = containerHTML.find('select[name=shiftpicker-units]');
			field.html('');
			for (let index = 1; index <= this.model.maxUnits; index++) {
				field.append(`<option value="${index}">${index} unidades / max. ${index * 2} personas</option>`); // TODO
			}

      commonLoader.hide();
    },

		/**
		 * Set new units value and refresh
		*/
		onUnitsChanged:  function(value) {
			this.model.units = value;
			
			// Refresh
			this.refresh();
		},

		/**
		 * Set new date and refresh
		*/
		onDateChanged:  function(value) {
			const {
				api_date_format,
			} = this.model;

			this.model.date = YSDFormatter.formatDate(value, api_date_format);
			
			// Refresh
			this.refresh();
		},

		/**
		 * Initialize date
		*/
		initializeDate: function() {
			const {
				requestLanguage,
				containerHTML,
				date,
			} = this.model;

			$.datepicker.setDefaults( $.datepicker.regional[requestLanguage] );
			
			const inputDate = containerHTML.find('input[name=shiftpicker-date]');

			const instanceDate = new Date(date);
			inputDate.datepicker({
				minDate: instanceDate,
			});

			inputDate.datepicker('setDate', instanceDate);

			inputDate.off('change');
			inputDate.on('change', (event) => {
				event.preventDefault();

				const value = inputDate.datepicker('getDate');

				this.onDateChanged(value);
			});
		},

		/**
		 * Initialize text date
		*/
		initializeTextDate: function() {
			const {
				containerHTML,
				date,
			} = this.model;

			const formatDate = moment(date).format("dddd, D MMMM YYYY");

			containerHTML.find('.shiftpicker-text-date').html(formatDate);
		},

		/**
		 * Initialize scroll calendar
		*/
		initializeScrollCalendar: async function() {
			
			commonLoader.show();

			// Get dates
			this.model.dates =  await this.getDates();
			if (this.model.dates.length > 0) {
				this.model.date =  this.model.dates[0];
			}
			
			// Initialize date field
			this.initializeDate();
			// Initialize title text date
			this.initializeTextDate();

			commonLoader.hide();
		},

		/*
		* Refresh 
		*/
		refresh: function() {
			//  TODO
			this.initializeTextDate();
			console.log('-------REFRESH: ', this.model);
		}
  };

  /***
   * ========= The view
   */
  const view = {
    /**
     * Initizialize
     */
    init: function () {
			// Get request language
			const requestLanguage = commonSettings.language(
				document.documentElement.lang || 'es'
			);
		
			// Initialize i18next for translations
			i18next.init(
				{
					lng: requestLanguage,
					resources: commonTranslations,
				},
				function () {
					// https://github.com/i18next/jquery-i18next#initialize-the-plugin
					//jqueryI18next.init(i18next, $);
					// Localize UI
					//$('.nav').localize();
				}
			);

			// Moment config
			moment.locale(requestLanguage);
		
			// Load settings
			commonLoader.show();
			commonSettings.loadSettings((data) => {
				commonLoader.hide();
		
				// Extend the model
				this.model = {
					...this.model,
					requestLanguage,
					date: data.serverDate,
					common: data,
				};

				this.setupControls();
				this.setupEvents();
				this.refresh();
			});
		},

		/**
     * Set Controls
     */
    setupControls: function () {
			this.initializeUnitsSelector();
			this.initializeScrollCalendar();
    },

    /**
     * Set Events
     */
    setupEvents: function () {
			const {
				containerHTML,
			} = this.model;

			containerHTML.find('select[name=shiftpicker-units]').on('change',  (event) => {
				event.preventDefault();

				const value = $(event.currentTarget).val();

				this.onUnitsChanged(value);
			});
    },

		/**
     * Set Validations
     */
		setupValidations: function() { // TODO
			$('form[name=mybooking-shiftpicker-form]').validate({
				submitHandler: function (form, event) {
          event.preventDefault();
        },
        rules: {},
        messages: {},
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent());
        },
        errorClass: 'form-reservation-error',
     });
		}
  };

  // -----------------------------------------

  /**
   * ShiftPicker factory
   */
  const shiftPicker = {
    /**
     * Initizialize
     */
    init: function () {
			$('.mybooking-shiftpicker .mybooking-shiftpicker-content').each(
        (index, item) => {
          // Unique id for instance
          const id = $(item).attr('id');
          const containerHTML = $('#' + id);
					const categoryCode = containerHTML.attr('data-category-code');
					const rentalLocationCode = containerHTML.attr('data-rental-location-code');

          // Default settings for instance
					const settings = {
						containerHTML,
						category_code: categoryCode,
						rental_location_code: rentalLocationCode || undefined,
						units: 1,
						date: undefined,
						turn: undefined,
					};

          // Create a ShiftPicker instance
					this.factory(settings).init();
        }
      );
    },

    /**
     * Factory to create ShiftPicker instances
     */
    factory: function (settings) {
      // The proptotype => Clones the model, controller and view
      ShiftPicker.prototype = {
        ...model, // Appends the model (cloning)
        ...controller, // Appends the controller (cloning)
        ...view, // Appends the view (cloning)
      };

      // Creates a new instance of the ShiftPicker
      return new ShiftPicker(settings);
    },
  };

  shiftPicker.init();
});
