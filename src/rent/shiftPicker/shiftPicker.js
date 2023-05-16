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
			datesTo: 7,
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
			commonLoader.show();

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
            console.error('Error', error);
            
						alert('Se ha producido un error en las unidades'); // TODO

            resolve(1);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},

		/**
	 	* Get dates
	 	*/
		getDates: function(from, to) {
			commonLoader.show();

			const {
        category_code,
				rental_location_code,
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

			// Category code
			urlParams.push('product=' + category_code);

			// Dates
			urlParams.push('from=' + from);
			urlParams.push('to=' + to);

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
            console.error('Error', error);
            
						alert('Se ha producido un error en las fechas'); // TODO

            resolve(1);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},

		/**
	 	* Get turns
	 	*/
		getTurns: function() {
			commonLoader.show();

			const {
        category_code,
				rental_location_code,
				units,
				date,
      } = this.model;

      let url = `${commonServices.URL_PREFIX}api/booking/frontend/products/${category_code}/turns`;
      const urlParams = [];

      // APi Key
      if (commonServices.apiKey && commonServices.apiKey !== '') {
        urlParams.push('api_key=' + commonServices.apiKey);
      }

			// Rental location code
			if (rental_location_code) {
        urlParams.push('rental_location_code=' + rental_location_code);
      }

			// Category code
			urlParams.push('product=' + category_code);

			// Units
			urlParams.push('units=' + units);

			// Dates
			urlParams.push('date=' + date);

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
            console.error('Error', error);
            
						alert('Se ha producido un error en los turnos'); // TODO

            resolve([]);
          })
					.then(function() {
						commonLoader.hide();
					});
      });
		},
  };

  /***
   * =============== The controller
   */
  const controller = {
		/**
		 * Set new units value and refresh
		*/
		onUnitsChanged:  function(value) {
			this.model.units = value;
			
			// Refresh
			this.refresh();
		},

		/**
     * Initialize units selector
     */
    initializeUnitsSelector: async function() {
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

			// Setup field events
			field.on('change',  (event) => {
				event.preventDefault();

				const value = $(event.currentTarget).val();

				this.onUnitsChanged(value);
			});
    },

		/**
		 * Set new date and refresh
		*/
		onDateChanged:  function(value) {
			this.model.date = value;
			
			// Refresh
			this.refresh();
		},

		/**
		 * Set date
		*/
		refreshDate: function() {
			const {
				containerHTML,
				date,
			} = this.model;

			containerHTML.find('input[name=shiftpicker-date]').datepicker('setDate', new Date(date));
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

			// Setup events
			inputDate.off('change');
			inputDate.on('change', (event) => {
				event.preventDefault();

				const {
					api_date_format,
				} = this.model;

				const value =  YSDFormatter.formatDate(inputDate.datepicker('getDate'), api_date_format);

				// If field value is the first dates element
				const buttonBack = containerHTML.find('.shiftpicker-arrow[data-direction=back]');
				if (value === this.model.dates[0]) {
					// Add left arrow disabled atribute
					buttonBack.attr('disabled', 'disabled');
				} else {
					// Remove left arrow disabled atribute
					buttonBack.removeAttr('disabled');
				}

				// If field value is last element
				const index = this.model.dates.indexOf(value);
				if (!index || index >= this.model.dates.length - 1) {
					// Get next dates
					const initialDate = this.model.dates.pop();
					this.getNextDates(initialDate, YSDFormatter.formatDate(moment(value).add(this.model.datesTo, 'days'), api_date_format));
				}

				this.onDateChanged(value);
			});
		},

		/**
		 * Initialize text date
		*/
		refreshTextDate: function() {
			const {
				containerHTML,
				date,
			} = this.model;

			const formatDate = moment(date).format("dddd, D MMMM YYYY");

			containerHTML.find('.shiftpicker-text-date').html(formatDate);
		},

		/**
		 *Gest next moth in calendar
		*/
		getNextDates: async function(from, to) {
			const newDates = await this.getDates(from, to);

			// Remove first element
			// newDates.shift();

			this.model.dates =  [
				...this.model.dates,
				...newDates,
			];
		},

		initializeTurnsSelector: async function() {
			const {
				containerHTML,
			} = this.model;

			const turnsSelector = containerHTML.find('.shiftpicker-turns');

			// Get turns
			const turns = await this.getTurns();

			turns.forEach((turn)=> {
				debugger;
				// TODO
				const {
					from,
					to,
				} = turn;
				
				const URL = `<li class="mybooking-shiftpicker-container-list-item" data-status="enabled">
						<span class="mybooking-shiftpicker-container-list-item_text">${from} -> ${to}</span>
						<input type="radio" name="time" value="${from} - ${to}" class="mybooking-shiftpicker-container-list-item_value">
					</li>`;
				turnsSelector.append(URL);
			});
		},

		/**
		 * Initialize scroll buttons
		*/
		initializeScrollButtons: async function() {
			const {
				containerHTML,
			} = this.model;

			const buttons = containerHTML.find('.shiftpicker-arrow');
			const buttonBack = containerHTML.find('.shiftpicker-arrow[data-direction=back]');
			// const buttonNext = containerHTML.find('.shiftpicker-arrow[data-direction=next]');

			// Set disabled atribute in left arrow when date is the first dates value
			if (this.model.date === this.model.dates[0]) {
				buttonBack.attr('disabled', 'disabled');
			}

			//  Setup events
			buttons.on('click', (event) => {
				event.preventDefault();

				const {
					api_date_format,
				} = this.model;

				const target = $(event.currentTarget);
				let index = this.model.dates.indexOf(this.model.date);
				const direction = target.attr('data-direction');

				switch (direction) {
					case 'next':
						// Get next dates one day first the last element
						if (!index || index >= this.model.dates.length - 1) {
							const initialDate = this.model.dates.pop();
							this.getNextDates(initialDate, YSDFormatter.formatDate(moment(this.model.date).add(this.model.datesTo, 'days'), api_date_format));
						}
						if (index === 0) {
							// Remove left arrow disabled atribute
							buttonBack.removeAttr('disabled');
						}

						this.model.date = this.model.dates[index + 1];
						break;
				
					case 'back':
							this.model.date = this.model.dates[index - 1];
							if (index === 1) {
								// Add left arrow disabled atribute
								buttonBack.attr('disabled', 'disabled');
							}
							break;

					default:
						this.model.date = this.model.dates[index + 1];
						break;
				}

				// Refresh
				this.refresh();
			});
		},

		/**
		 * Initialize scroll calendar
		*/
		initializeScrollCalendar: async function() {
			const {
				api_date_format,
				date,
			} = this.model;

			// Get dates
			this.model.dates =  await this.getDates(date, YSDFormatter.formatDate(moment(date).add(this.model.datesTo, 'days'), api_date_format));
			if (this.model.dates.length > 0) {
				this.model.date =  this.model.dates[0];
			}
			
			// Initialize date field
			this.initializeDate();
			// Refresh title text date
			this.refreshTextDate();
			// Initialize scroll buttons
			this.initializeScrollButtons();
			// Initialize turns selector
			this.initializeTurnsSelector();
		},

		/*
		* Refresh 
		*/
		refresh: function() {
			this.refreshDate();
			this.refreshTextDate();
			
			console.info('-------REFRESH: ', this.model);
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
