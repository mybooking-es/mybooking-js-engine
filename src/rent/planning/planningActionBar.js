define('planningActionBar', ['jquery', 'YSDEventTarget', 'commonSettings',
       'moment', 'YSDFormatter', 'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
       'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
       'jquery.ui.datepicker.validation'],
       function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function ActionBar({ target, parent, columnsWidth, columnsTotal  }) {
		/**
		 * PlanningActionBar data model
		*/
		this.model = {
			parent,
			target: target || 'mybooking-head',
			columns: {
				width: columnsWidth || 150,
				visibles: 0,
				actualMargin: 0,
				total: 0,
			}
		};
	}

	var model = {
	};

	var controller = {
		setCategory: function(event){
			var value = $(event.currentTarget).val();

			this.model.parent.model.category = value;

			var target = document.getElementById(this.model.parent.model.target);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Set new date and refresh planning
		*/
		setDate:  function(paramDate) {
			this.model.parent.model.date.actual = paramDate;

			var target = document.getElementById(this.model.parent.model.target);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function(paramDate) {
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			var inputDate = $('#' + this.model.target + ' input[name=date]');
			inputDate.datepicker({
				minDate: this.model.parent.model.date.actual,
			});

			inputDate.datepicker('setDate', this.model.parent.model.date.actual);

			var that = this;
			$('#' + this.model.target + ' input[name=date]').off('change');
			$('#' + this.model.target + ' input[name=date]').on('change', function() {
				var value = $(this).datepicker('getDate');

				that.setDate(value);
			});
		},

		refresh: function({ total, category }) {
			if (total > 0) {
				this.setColumns(total);
			}

			this.setScrollCalendarButtonsState();
			this.setScrollButtonsState();

			$('#' + this.model.target + ' select[name=category]').val(category);
		},
	};

	var view = {
		/**
		 * Set columns width and fix container to show complete columns
		*/
		setColumns: function(total) {
			this.model.columns.total = total;

			var target = $('#' + this.model.parent.model.target);
			var container = $(target).find('.mybooking-planning-scrollable');
			var ths = $(target).find('thead th:not(.mybooking-planning-td-fix)');
			var tds = $(target).find('tbody td');
			var containerWidth = $('#' + this.model.parent.model.target).closest('.mybooking-planning-table-content').width() - window.parseInt(container.css('margin-left'));

			this.model.columns.visibles = Math.floor(containerWidth / this.model.columns.width);

			if (this.model.columns.visibles > this.model.columns.total) {
				this.model.columns.visibles = this.model.columns.total;
			}

			ths.css('width', this.model.columns.width + 'px' );
			tds.css('width', this.model.columns.width + 'px' );
			container.css('width', (this.model.columns.visibles * this.model.columns.width) + 'px');
			
			if (this.model.columns.total * this.model.columns.width > this.model.columns.actualMargin * -1){
				container.find('table').css('margin-left', this.model.columns.actualMargin);
			}
		},

		/**
		 * Scroll calendar
		*/
		setScrollCalendarButtonsState: function(){
			var dateButtons = $('#' + this.model.target + ' button[data-action=date]');
			var firstDate = moment(this.model.parent.model.calendar[0]).add(1, 'd');
			var lastDate = moment(this.model.parent.model.calendar.slice(-1).pop()).subtract(1, 'd');

			if(moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
				$(dateButtons[0]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[0]).removeAttr('disabled');
			}
			if(moment(this.model.parent.model.date.actual).isAfter(lastDate)) {
				$(dateButtons[1]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[1]).removeAttr('disabled');
			}
		},
		scrollCalendar: function(event) {
			var target = $(event.currentTarget);
			var direction = target.attr('data-direction');

			if (this.model.parent.model.calendar.length > 0){
				var date = this.model.parent.model.date.actual;

				var firstDate = moment(this.model.parent.model.calendar[0]);
				var lastDate = moment(this.model.parent.model.calendar.slice(-1).pop());

				if (direction === 'next') {
					var newDate = moment(date).add(1, 'd');
					var index1 = 1;

					while (index1 < 60 && newDate.isBefore(lastDate)) {
						var formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
						var newInstanceDate = new Date(formateDate);
		
						var isInclude = this.model.parent.model.calendar.includes(formateDate);
						if (isInclude){
							var inputDate = $('#' + this.model.target + ' input[name=date]');
							inputDate.datepicker('setDate', newInstanceDate);
							this.setDate(newInstanceDate);
							return;
						}
						
						index1 += 1;
						newDate = moment(date).add(index1, 'd');
					}
				} else if (direction === 'back') {
					var newDate = moment(date).subtract(1, 'd');
					var index2 = 1;

					while (index2 < 60 && newDate.isAfter(firstDate)) {
						var formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
						var newInstanceDate = new Date(formateDate);
		
						var isInclude = this.model.parent.model.calendar.includes(formateDate);
						if (isInclude){
							var inputDate = $('#' + this.model.target + ' input[name=date]');
							inputDate.datepicker('setDate', newInstanceDate);
							this.setDate(newInstanceDate);
							return;
						}

						index2 += 1;
						newDate = moment(date).subtract(index2, 'd');
					}
				}
			}
		},

		/**
		 * Horizontal scroll
		*/
		setScrollButtonsState: function(){
			console.log(this.model.columns.total, this.model.columns.visibles, this.model.columns.width);
			var actualMargin = this.model.columns.actualMargin;

			var scrollButtons = $('#' + this.model.target + ' button[data-action=scroll]');

			if (actualMargin >= 0) {
				$(scrollButtons[0]).attr('disabled', 'disabled');
			} else {
				$(scrollButtons[0]).removeAttr('disabled');
			}

			if ((actualMargin * -1) >= ((this.model.columns.total - this.model.columns.visibles) * this.model.columns.width)) {
				$(scrollButtons[1]).attr('disabled', 'disabled');
			} else {
				$(scrollButtons[1]).removeAttr('disabled');
			}
		},

		scroll: function(event) {
			var target = $(event.currentTarget);
			var direction = target.attr('data-direction');

			var container = $('#' + this.model.parent.model.target).find('.mybooking-planning-scrollable table');

			var actualMargin = 0;
			if (direction === 'next') {
				actualMargin = this.model.columns.actualMargin +  (this.model.columns.width * -1);
			} else if (direction === 'back') {
				actualMargin = this.model.columns.actualMargin + this.model.columns.width;
			}

			this.model.columns.actualMargin = actualMargin;
			this.setScrollButtonsState();

			container.animate({
				marginLeft: this.model.columns.actualMargin,
			}, {
				duration: 1000
			});
		},

		/**
		 * Events
		*/
		setEvents: function() {
			/*
			* Button next events
			*/
			var scrollButtons = $('#' + this.model.target + ' button[data-action=scroll]');

			this.setScrollButtonsState();
			scrollButtons.off('click');
			scrollButtons.on('click', this.scroll.bind(this));

			/*
			* Category selector
			*/
			var categorySelector = $('#' + this.model.target + ' select[name=category]');
			categorySelector.off('change');
			categorySelector.on('change', this.setCategory.bind(this));

			/*
			* Calendar scroll
			*/
			var dateButtons = $('#' + this.model.target + ' button[data-action=date]');

			dateButtons.off('click');
			dateButtons.on('click', this.scrollCalendar.bind(this));
		},

		setValidations: function() {
			$('#' + this.model.target).validate({
				submitHandler: function(form, event) {
					event.preventDefault();
				},
				rules: {         
				},
				messages: {
				},
				errorPlacement: function (error, element) {
					error.insertAfter(element.parent());
				},
				errorClass : 'form-reservation-error'
		 });
		},

		/**
		 * Initizialize
		*/
		init:  function ({ total, category }) {
			this.refresh({ total, category });
			this.initializeDate();
			this.setValidations();
			this.setEvents();
		}
	};

	var planningActionBar = {
		/**
		 * Factory
		*/
		factory: function(obj) {
			ActionBar.prototype = {
				...model,
				...controller,
				...view,
			};

			return new ActionBar(obj); 
		},

		/**
		 * Initizialize
		*/
		init: function({ parent, settings , total, category}) {
			var initSettings = {
				parent,
				...settings,
			};

			var  actionBar = this.factory(initSettings);
			actionBar.init({ total, category });
		},
	};

	return planningActionBar;
});