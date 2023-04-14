// eslint-disable-next-line no-undef
define('productPlanningWeekActionBar', ['jquery', 'YSDEventTarget', 'commonSettings',
       'moment', 'YSDFormatter', 'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
       'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
       'jquery.ui.datepicker.validation'],
       function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function WeekActionBar({ target, parent }) {
		/**
		 * ProductPlanningWeekActionBar data model
		*/
		this.model = {
			parent, // It is an instance of ProductPlannigWeek
			target, // Element that contains the table head (.mybooking-product-planning-week-head)
		};
	}

	const model = {
	};

	const controller = {
		/**
     * Set category
     */
    setCategory: function (event, newValue) {
      const value = $(event.currentTarget).val() || newValue;

      this.model.parent.model.category = value;

      const target = document.getElementById(this.model.parent.model.targetId);
      target.dispatchEvent(
        new CustomEvent('refresh', {
          detail: { callback: this.refresh.bind(this) },
        })
      );
    },

    /**
     * Initialize category
     */
    initializeCategory: function () {
      const categorySelector = this.model.target.find('select[name=category]');
      categorySelector.html('');
      categorySelector.closest('.field').css('display', 'block');

			const {
				categories,
			} = this.model.parent.model;

      if (
        categories.length &&
        categories.length > 0
      ) {
        categories.forEach((item) => {
					const option = '<option value="' + item.code + '">' + item.name + '</option>';

					categorySelector.append(option);
        });

        /*
         * Set events
         */
        categorySelector.off('change');
        categorySelector.on('change', this.setCategory.bind(this));
        categorySelector.removeAttr('disabled');
      } else {
        categorySelector.attr('disabled', 'disabled');
      }
    },

		/**
		 * Set new date and refresh planning
		*/
		onDateChanged:  function(paramDate) {
			this.model.parent.model.date.actual = YSDFormatter.formatDate(paramDate, this.model.parent.model.api_date_format);
			const target = document.getElementById(this.model.parent.model.targetId);

			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function() {
			$.datepicker.setDefaults( $.datepicker.regional[this.model.parent.model.requestLanguage] );
			
			const inputDate = this.model.parent.model.planningHTML.find('input[name=date]');
			const date = new Date (this.model.parent.model.date.actual);
			
			inputDate.datepicker({
				minDate: date,
			});

			inputDate.datepicker('setDate', date);

			inputDate.off('change');
			inputDate.on('change', (event) => {
				event.preventDefault();

				const value = inputDate.datepicker('getDate');

				this.onDateChanged(value);
			});
		},

		/**
		 *Refresh
		 */
		refresh: function({ originalCategory, category }) {
			if (this.model.parent.model.realCalendar.length > 0) {
				this.setScrollCalendarButtonsState();
			}

			if (!originalCategory && category) {
        this.initializeCategory();
        this.model.target.find('select[name=category]').val(category);
      }
		},
	};

	const view = {
		/**
		 * Scroll calendar
		*/
		setScrollCalendarButtonsState: function(){
			const dateButtons = this.model.parent.model.planningHTML.find('button[data-action=date]');
			const firstDate = moment(new Date(this.model.parent.model.configuration.serverDate));

			if(moment(this.model.parent.model.date.actual).isSame(firstDate) ||moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
				$(dateButtons[0]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[0]).removeAttr('disabled');
			}
		},
		scrollCalendar: function(event) {
			const target = $(event.currentTarget);
			const direction = target.attr('data-direction');

			if (this.model.parent.model.realCalendar.length > 0){
				const date = new Date (this.model.parent.model.date.actual);

				const newDate = direction === 'next' ? moment(date).add(7, 'd') : moment(date).subtract(7, 'd');
				const formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
				const newInstanceDate = new Date(formateDate);

				const inputDate = this.model.parent.model.planningHTML.find('input[name=date]');
				inputDate.datepicker('setDate', newInstanceDate);
				// Notify that the date has changed in order to be processed by the event
				inputDate.trigger('change');
			}
		},
		
		/**
		 * Events
		*/
		setupEvents: function() {
			/*
			* Calendar scroll
			*/
			const dateButtons = this.model.parent.model.planningHTML.find('button[data-action=date]');

			if (this.model.parent.model.realCalendar.length > 0) {
				dateButtons.off('click');
				dateButtons.on('click', this.scrollCalendar.bind(this));
			} else {
				dateButtons.attr('disabled', 'disabled');
			}
		},

		/**
     * Set validations
     */
    setupValidations: function () {
      this.model.target.validate({
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
    },

		/**
		 * Initizialize
		*/
		init:  function ({  originalCategory, category }) {
			this.refresh({ originalCategory, category });

			this.initializeDate();

			this.setupEvents();
			this.setupValidations();
		}
	};

	const ProductPlanningWeekActionBar = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			WeekActionBar.prototype = {
				...model,
				...controller,
				...view,
			};

			return new WeekActionBar(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function({ settings, originalCategory, category }) {
			const  weekActionBar = this.factory(settings);
			weekActionBar.init({ originalCategory, category });
		},
	};

	return ProductPlanningWeekActionBar;
});