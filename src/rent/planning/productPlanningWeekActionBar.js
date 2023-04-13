// eslint-disable-next-line no-undef
define('productPlanningWeekActionBar', ['jquery', 'YSDEventTarget', 'commonSettings',
       'moment', 'YSDFormatter', 'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
       'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
       'jquery.ui.datepicker.validation'],
       function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function WeekActionBar({ parent, target }) {
		/**
		 * ProductPlanningWeekActionBar data model
		*/
		this.model = {
			parent, // It is an instance of ProductPlannigWeek
			target  // Element that contains the table with timetables (.mybooking-product-planning-week-table)
		};
	}

	const model = {
	};

	const controller = {
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
		refresh: function() {
			if (this.model.parent.model.realCalendar.length > 0) {
				this.setScrollCalendarButtonsState();
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
		setEvents: function() {
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
		 * Initizialize
		*/
		init:  function () {
			this.refresh();
			this.initializeDate();
			this.setEvents();
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
		init: function({ parent, settings }) {
			const initSettings = {
				parent,
				...settings,
			};

			const  WeekActionBar = this.factory(initSettings);
			WeekActionBar.init();
		},
	};

	return ProductPlanningWeekActionBar;
});