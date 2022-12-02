// eslint-disable-next-line no-undef
define('planningActionBar', ['jquery', 'YSDEventTarget', 'commonSettings',
       'moment', 'YSDFormatter', 'jquery.validate', 'jquery.ui', 'jquery.ui.datepicker-es',
       'jquery.ui.datepicker-en', 'jquery.ui.datepicker-ca', 'jquery.ui.datepicker-it',
       'jquery.ui.datepicker.validation'],
       function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function ActionBar({ target, parent, columnsWidth  }) {
		/**
		 * PlanningActionBar data model
		*/
		this.model = {
			parent,
			target,
			columns: {
				width: columnsWidth || 150,
				visibles: 0,
				actualMargin: 0,
				total: 0,
			}
		};
	}

	var model = {
	};

	var controller = {
		/**
		 * Set family
		*/
		setFamily: function(event){
			var value = $(event.currentTarget).val();

			this.model.parent.model.family = value;

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize family
		*/
		initializeFamily: function(){
			var familySelector = this.model.target.find('select[name=family]');
			familySelector.closest('.field').css('display', 'block');

			if (this.model.parent.model.families && this.model.parent.model.families.length > 0) {
				this.model.parent.model.families.forEach(function(item) {
					familySelector.append('<option value="' + item.id + '">' + item.name + '</option>')
				});

					/*
				* Set events
				*/
				familySelector.off('change');
				familySelector.on('change', this.setCategory.bind(this));
			} else {
				familySelector.attr('disabled', 'disabled');
			}
		},

		/**
		 * Set category
		*/
		setCategory: function(event){
			var value = $(event.currentTarget).val();

			this.model.parent.model.category = value;

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize category
		*/
		initializeCategory: function(){
			var categorySelector = this.model.target.find('select[name=category]');
			categorySelector.closest('.field').css('display', 'block');

			if (this.model.parent.model.categories.length && this.model.parent.model.categories.length > 0) {
				this.model.parent.model.categories.forEach(function(item) {
					categorySelector.append('<option value="' + item.code + '">' + item.name + '</option>')
				});

				/*
				* Set events
				*/
				categorySelector.off('change');
				categorySelector.on('change', this.setCategory.bind(this));
			} else {
				categorySelector.attr('disabled', 'disabled');
			}
		},

		/**
		 * Set new date and refresh planning
		*/
		setDate:  function(paramDate) {
			this.model.parent.model.date.actual = YSDFormatter.formatDate(paramDate, this.model.parent.model.api_date_format);

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function() {
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			var inputDate = this.model.target.find('input[name=date]');
			var date = new Date (this.model.parent.model.date.actual);

			inputDate.datepicker({
				minDate: new Date (this.model.parent.model.configuration.serverDate),
			});

			inputDate.datepicker('setDate', date);

			var that = this;
			this.model.target.find('input[name=date]').off('change');
			this.model.target.find('input[name=date]').on('change', function() {
				var value = $(this).datepicker('getDate');

				that.setDate(value);
			});
		},

		refresh: function({ total, family, category }) {
			if (total > 0) {
				this.setColumns(total);
			}

			if (this.model.parent.model.realCalendar.length > 0) {
				this.setScrollCalendarButtonsState();
			}

			this.setScrollButtonsState();

			if (family) {
				this.model.target.find('select[name=family]').val(family);
			}
			if (category) {
				this.model.target.find('select[name=category]').val(category);
			}
		},
	};

	var view = {
		/**
		 * Set columns width and fix container to show complete columns
		*/
		setColumns: function(total) {
			this.model.columns.total = total;

			var target = this.model.parent.model.target;
			var container = $(target).find('.mybooking-planning-scrollable');
			var ths = $(target).find('thead th:not(.mybooking-planning-td-fix)');
			var tds = $(target).find('tbody td');
			var containerWidth = this.model.parent.model.target.closest('.mybooking-planning-content').width() - window.parseInt(container.css('margin-left'));

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
			var dateButtons = this.model.target.find('button[data-action=date]');
			var firstDate = moment(this.model.parent.model.configuration.serverDate);

			if(moment(this.model.parent.model.date.actual).isSame(firstDate) ||moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
				$(dateButtons[0]).attr('disabled', 'disabled');
			} else {
				$(dateButtons[0]).removeAttr('disabled');
			}
		},

		scrollCalendar: function(event) {
			var target = $(event.currentTarget);
			var direction = target.attr('data-direction');

			if (this.model.parent.model.realCalendar.length > 0){
				var date = new Date (this.model.parent.model.date.actual);

				var newDate = direction === 'next' ? moment(date).add(1, 'd') : moment(date).subtract(1, 'd');
				var formateDate = YSDFormatter.formatDate(newDate, this.model.parent.model.api_date_format);
				var newInstanceDate = new Date(formateDate);

				var inputDate = this.model.target.find('input[name=date]');
				inputDate.datepicker('setDate', newInstanceDate);

				this.setDate(newInstanceDate);
			}
		},

		/**
		 * Horizontal scroll
		*/
		setScrollButtonsState: function(){
			var actualMargin = this.model.columns.actualMargin;

			var scrollButtons = this.model.target.find('button[data-action=scroll]');

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

			var container = this.model.parent.model.target.find('.mybooking-planning-scrollable table');

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
			var scrollButtons = this.model.target.find('button[data-action=scroll]');

			this.setScrollButtonsState();
			scrollButtons.off('click');
			scrollButtons.on('click', this.scroll.bind(this));

			/*
			* Calendar scroll
			*/
			var dateButtons = this.model.target.find('button[data-action=date]');

			if (this.model.parent.model.realCalendar.length > 0) {
				dateButtons.off('click');
				dateButtons.on('click', this.scrollCalendar.bind(this));
			} else {
				dateButtons.attr('disabled', 'disabled');
			}
		},

		setValidations: function() {
			this.model.target.validate({
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
		init:  function ({ total, family, category }) {
			this.refresh({ total, family, category });
			this.initializeDate();
			if (family) {
				this.initializeFamily();
			}
			if (category) {
				this.initializeCategory();
			}
			this.setEvents();
			this.setValidations();
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
		init: function({ settings, total, family, category}) {
			var  actionBar = this.factory(settings);
			actionBar.init({ total, family, category });
		},
	};

	return planningActionBar;
});