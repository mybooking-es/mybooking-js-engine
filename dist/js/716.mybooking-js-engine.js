(self["webpackChunkmybooking_js_engine"] = self["webpackChunkmybooking_js_engine"] || []).push([[716],{

/***/ 5716:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(9755), __webpack_require__(2599), __webpack_require__(8041),
       __webpack_require__(967), __webpack_require__(5404), __webpack_require__(5805), __webpack_require__(2663), __webpack_require__(350),
       __webpack_require__(7192), __webpack_require__(9650), __webpack_require__(6218),
       __webpack_require__(5237)], __WEBPACK_AMD_DEFINE_RESULT__ = (function($, YSDEventTarget, commonSettings, moment, YSDFormatter) {

	/**
	 * Contructor
	*/
	function ActionBar({ target, parent, columnsWidth, total  }) {
		/**
		 * PlanningActionBar data model
		*/
		this.model = {
			parent,
			target,
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

			if (this.model.parent.model.categories.length > 0) {
				this.model.parent.model.categories.forEach(function(item) {
					categorySelector.append('<option value="' + item.code + '">' + item.name + '</option>')
				});
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
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			var inputDate = this.model.target.find('input[name=date]');
			var date = new Date (this.model.parent.model.date.actual);
			
			inputDate.datepicker({
				minDate: date,
			});

			inputDate.datepicker('setDate', date);

			var that = this;
			this.model.target.find('input[name=date]').off('change');
			this.model.target.find('input[name=date]').on('change', function() {
				var value = $(this).datepicker('getDate');

				that.setDate(value);
			});
		},

		refresh: function({ total, category }) {
			if (total > 0) {
				this.setColumns(total);
			}

			if (this.model.parent.model.realCalendar.length > 0) {
				this.setScrollCalendarButtonsState();
			}

			this.setScrollButtonsState();

			this.model.target.find('select[name=category]').val(category);
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
			var firstDate = moment(new Date(this.model.parent.model.configuration.serverDate)).add(1, 'd');

			if(moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
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
			* Category selector
			*/
			var categorySelector = this.model.target.find('select[name=category]');
			categorySelector.off('change');
			categorySelector.on('change', this.setCategory.bind(this));

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
		init:  function ({ total, category }) {
			this.refresh({ total, category });
			this.initializeDate();
			this.initializeCategory();
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
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcGxhbm5pbmdBY3Rpb25CYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBNEIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFnQixFQUFFLHlCQUFnQjtBQUN6RSxPQUFPLHdCQUFRLEVBQUUseUJBQWMsRUFBRSx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUMxRixPQUFPLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN0RixPQUFPLHlCQUFpQyxDQUFDLG1DQUNsQzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUNBQXVDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9EQUFvRCxVQUFVLHFDQUFxQztBQUNuRyxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVILHFCQUFxQixrQkFBa0I7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFk7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEMsaUJBQWlCLGtCQUFrQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkI7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixvQ0FBb0M7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDLEdBQUc7QUFDSDs7QUFFQTtBQUNBLENBQUM7QUFBQSxrR0FBQyxDIiwiZmlsZSI6IjcxNi5teWJvb2tpbmctanMtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCdwbGFubmluZ0FjdGlvbkJhcicsIFsnanF1ZXJ5JywgJ1lTREV2ZW50VGFyZ2V0JywgJ2NvbW1vblNldHRpbmdzJyxcbiAgICAgICAnbW9tZW50JywgJ1lTREZvcm1hdHRlcicsICdqcXVlcnkudmFsaWRhdGUnLCAnanF1ZXJ5LnVpJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVzJyxcbiAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItZW4nLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItY2EnLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItaXQnLFxuICAgICAgICdqcXVlcnkudWkuZGF0ZXBpY2tlci52YWxpZGF0aW9uJ10sXG4gICAgICAgZnVuY3Rpb24oJCwgWVNERXZlbnRUYXJnZXQsIGNvbW1vblNldHRpbmdzLCBtb21lbnQsIFlTREZvcm1hdHRlcikge1xuXG5cdC8qKlxuXHQgKiBDb250cnVjdG9yXG5cdCovXG5cdGZ1bmN0aW9uIEFjdGlvbkJhcih7IHRhcmdldCwgcGFyZW50LCBjb2x1bW5zV2lkdGgsIHRvdGFsICB9KSB7XG5cdFx0LyoqXG5cdFx0ICogUGxhbm5pbmdBY3Rpb25CYXIgZGF0YSBtb2RlbFxuXHRcdCovXG5cdFx0dGhpcy5tb2RlbCA9IHtcblx0XHRcdHBhcmVudCxcblx0XHRcdHRhcmdldCxcblx0XHRcdGNvbHVtbnM6IHtcblx0XHRcdFx0d2lkdGg6IGNvbHVtbnNXaWR0aCB8fMKgMTUwLFxuXHRcdFx0XHR2aXNpYmxlczogMCxcblx0XHRcdFx0YWN0dWFsTWFyZ2luOiAwLFxuXHRcdFx0XHR0b3RhbDogMCxcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0dmFyIG1vZGVsID0ge1xuXHR9O1xuXG5cdHZhciBjb250cm9sbGVyID0ge1xuXHRcdC8qKlxuXHRcdCAqIFNldCBjYXRlZ29yeVxuXHRcdCovXG5cdFx0c2V0Q2F0ZWdvcnk6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdHZhciB2YWx1ZSA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCk7XG5cblx0XHRcdHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhdGVnb3J5ID0gdmFsdWU7XG5cblx0XHRcdHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXRJZCk7XG5cdFx0XHR0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlZnJlc2gnLCB7IGRldGFpbDogeyBjYWxsYmFjazogdGhpcy5yZWZyZXNoLmJpbmQodGhpcykgfX0gKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgY2F0ZWdvcnlcblx0XHQqL1xuXHRcdGluaXRpYWxpemVDYXRlZ29yeTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBjYXRlZ29yeVNlbGVjdG9yID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnc2VsZWN0W25hbWU9Y2F0ZWdvcnldJyk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0XHRjYXRlZ29yeVNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpdGVtLmNvZGUgKyAnXCI+JyArIGl0ZW0ubmFtZSArICc8L29wdGlvbj4nKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhdGVnb3J5U2VsZWN0b3IuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IG5ldyBkYXRlIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRzZXREYXRlOiAgZnVuY3Rpb24ocGFyYW1EYXRlKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKHBhcmFtRGF0ZSwgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuYXBpX2RhdGVfZm9ybWF0KTtcblxuXHRcdFx0dmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldElkKTtcblx0XHRcdHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgncmVmcmVzaCcsIHsgZGV0YWlsOiB7IGNhbGxiYWNrOiB0aGlzLnJlZnJlc2guYmluZCh0aGlzKSB9fSApKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZSBhbmQgcmVmcmVzaCBwbGFubmluZ1xuXHRcdCovXG5cdFx0aW5pdGlhbGl6ZURhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JC5kYXRlcGlja2VyLnNldERlZmF1bHRzKCAkLmRhdGVwaWNrZXIucmVnaW9uYWxbY29tbW9uU2V0dGluZ3MubGFuZ3VhZ2UoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcpIHx8wqAnZXMnXSApO1xuXHRcdFx0XG5cdFx0XHR2YXIgaW5wdXREYXRlID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpO1xuXHRcdFx0XG5cdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcih7XG5cdFx0XHRcdG1pbkRhdGU6IGRhdGUsXG5cdFx0XHR9KTtcblxuXHRcdFx0aW5wdXREYXRlLmRhdGVwaWNrZXIoJ3NldERhdGUnLCBkYXRlKTtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpLm9mZignY2hhbmdlJyk7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgdmFsdWUgPSAkKHRoaXMpLmRhdGVwaWNrZXIoJ2dldERhdGUnKTtcblxuXHRcdFx0XHR0aGF0LnNldERhdGUodmFsdWUpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdHJlZnJlc2g6IGZ1bmN0aW9uKHsgdG90YWwsIGNhdGVnb3J5IH0pIHtcblx0XHRcdGlmICh0b3RhbCA+IDApIHtcblx0XHRcdFx0dGhpcy5zZXRDb2x1bW5zKHRvdGFsKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnJlYWxDYWxlbmRhci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuc2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRTY3JvbGxCdXR0b25zU3RhdGUoKTtcblxuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQuZmluZCgnc2VsZWN0W25hbWU9Y2F0ZWdvcnldJykudmFsKGNhdGVnb3J5KTtcblx0XHR9LFxuXHR9O1xuXG5cdHZhciB2aWV3ID0ge1xuXHRcdC8qKlxuXHRcdCAqIFNldCBjb2x1bW5zIHdpZHRoIGFuZCBmaXggY29udGFpbmVyIHRvIHNob3cgY29tcGxldGUgY29sdW1uc1xuXHRcdCovXG5cdFx0c2V0Q29sdW1uczogZnVuY3Rpb24odG90YWwpIHtcblx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCA9IHRvdGFsO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0O1xuXHRcdFx0dmFyIGNvbnRhaW5lciA9ICQodGFyZ2V0KS5maW5kKCcubXlib29raW5nLXBsYW5uaW5nLXNjcm9sbGFibGUnKTtcblx0XHRcdHZhciB0aHMgPSAkKHRhcmdldCkuZmluZCgndGhlYWQgdGg6bm90KC5teWJvb2tpbmctcGxhbm5pbmctdGQtZml4KScpO1xuXHRcdFx0dmFyIHRkcyA9ICQodGFyZ2V0KS5maW5kKCd0Ym9keSB0ZCcpO1xuXHRcdFx0dmFyIGNvbnRhaW5lcldpZHRoID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0LmNsb3Nlc3QoJy5teWJvb2tpbmctcGxhbm5pbmctY29udGVudCcpLndpZHRoKCkgLSB3aW5kb3cucGFyc2VJbnQoY29udGFpbmVyLmNzcygnbWFyZ2luLWxlZnQnKSk7XG5cblx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA9IE1hdGguZmxvb3IoY29udGFpbmVyV2lkdGggLyB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzID4gdGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsKSB7XG5cdFx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA9IHRoaXMubW9kZWwuY29sdW1ucy50b3RhbDtcblx0XHRcdH1cblxuXHRcdFx0dGhzLmNzcygnd2lkdGgnLCB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggKyAncHgnICk7XG5cdFx0XHR0ZHMuY3NzKCd3aWR0aCcsIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCArICdweCcgKTtcblx0XHRcdGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgKHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCkgKyAncHgnKTtcblx0XHRcdFxuXHRcdFx0aWYgKHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCA+IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKiAtMSl7XG5cdFx0XHRcdGNvbnRhaW5lci5maW5kKCd0YWJsZScpLmNzcygnbWFyZ2luLWxlZnQnLCB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU2Nyb2xsIGNhbGVuZGFyXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxDYWxlbmRhckJ1dHRvbnNTdGF0ZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXHRcdFx0dmFyIGZpcnN0RGF0ZSA9IG1vbWVudChuZXcgRGF0ZSh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jb25maWd1cmF0aW9uLnNlcnZlckRhdGUpKS5hZGQoMSwgJ2QnKTtcblxuXHRcdFx0aWYobW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKS5pc0JlZm9yZShmaXJzdERhdGUpKSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzBdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzY3JvbGxDYWxlbmRhcjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuXHRcdFx0dmFyIGRpcmVjdGlvbiA9IHRhcmdldC5hdHRyKCdkYXRhLWRpcmVjdGlvbicpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwucmVhbENhbGVuZGFyLmxlbmd0aCA+IDApe1xuXHRcdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cblx0XHRcdFx0dmFyIG5ld0RhdGUgPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/IG1vbWVudChkYXRlKS5hZGQoMSwgJ2QnKSA6IG1vbWVudChkYXRlKS5zdWJ0cmFjdCgxLCAnZCcpO1xuXHRcdFx0XHR2YXIgZm9ybWF0ZURhdGUgPSBZU0RGb3JtYXR0ZXIuZm9ybWF0RGF0ZShuZXdEYXRlLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5hcGlfZGF0ZV9mb3JtYXQpO1xuXHRcdFx0XHR2YXIgbmV3SW5zdGFuY2VEYXRlID0gbmV3IERhdGUoZm9ybWF0ZURhdGUpO1xuXG5cdFx0XHRcdHZhciBpbnB1dERhdGUgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJyk7XG5cdFx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKCdzZXREYXRlJywgbmV3SW5zdGFuY2VEYXRlKTtcblx0XHRcdFx0dGhpcy5zZXREYXRlKG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEhvcml6b250YWwgc2Nyb2xsXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxCdXR0b25zU3RhdGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgYWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbjtcblxuXHRcdFx0dmFyIHNjcm9sbEJ1dHRvbnMgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdidXR0b25bZGF0YS1hY3Rpb249c2Nyb2xsXScpO1xuXG5cdFx0XHRpZiAoYWN0dWFsTWFyZ2luID49IDApIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzBdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzBdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoKGFjdHVhbE1hcmdpbiAqIC0xKSA+PSAoKHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCAtIHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcykgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpKSB7XG5cdFx0XHRcdCQoc2Nyb2xsQnV0dG9uc1sxXSkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoc2Nyb2xsQnV0dG9uc1sxXSkucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c2Nyb2xsOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdHZhciBjb250YWluZXIgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXQuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlIHRhYmxlJyk7XG5cblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSAwO1xuXHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdGFjdHVhbE1hcmdpbiA9IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKyAgKHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCAqIC0xKTtcblx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnYmFjaycpIHtcblx0XHRcdFx0YWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiArIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiA9IGFjdHVhbE1hcmdpbjtcblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdGNvbnRhaW5lci5hbmltYXRlKHtcblx0XHRcdFx0bWFyZ2luTGVmdDogdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbixcblx0XHRcdH0sIHtcblx0XHRcdFx0ZHVyYXRpb246IDEwMDBcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBFdmVudHNcblx0XHQqL1xuXHRcdHNldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvKlxuXHRcdFx0KiBCdXR0b24gbmV4dCBldmVudHNcblx0XHRcdCovXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cdFx0XHRzY3JvbGxCdXR0b25zLm9mZignY2xpY2snKTtcblx0XHRcdHNjcm9sbEJ1dHRvbnMub24oJ2NsaWNrJywgdGhpcy5zY3JvbGwuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhdGVnb3J5IHNlbGVjdG9yXG5cdFx0XHQqL1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub24oJ2NoYW5nZScsIHRoaXMuc2V0Q2F0ZWdvcnkuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhbGVuZGFyIHNjcm9sbFxuXHRcdFx0Ki9cblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwucmVhbENhbGVuZGFyLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0ZGF0ZUJ1dHRvbnMub2ZmKCdjbGljaycpO1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5vbignY2xpY2snLCB0aGlzLnNjcm9sbENhbGVuZGFyLmJpbmQodGhpcykpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGF0ZUJ1dHRvbnMuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c2V0VmFsaWRhdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQudmFsaWRhdGUoe1xuXHRcdFx0XHRzdWJtaXRIYW5kbGVyOiBmdW5jdGlvbihmb3JtLCBldmVudCkge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJ1bGVzOiB7ICAgICAgICAgXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1lc3NhZ2VzOiB7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiAoZXJyb3IsIGVsZW1lbnQpIHtcblx0XHRcdFx0XHRlcnJvci5pbnNlcnRBZnRlcihlbGVtZW50LnBhcmVudCgpKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JDbGFzcyA6ICdmb3JtLXJlc2VydmF0aW9uLWVycm9yJ1xuXHRcdCB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGl6aWFsaXplXG5cdFx0Ki9cblx0XHRpbml0OiAgZnVuY3Rpb24gKHsgdG90YWwsIGNhdGVnb3J5IH0pIHtcblx0XHRcdHRoaXMucmVmcmVzaCh7IHRvdGFsLCBjYXRlZ29yeSB9KTtcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZURhdGUoKTtcblx0XHRcdHRoaXMuaW5pdGlhbGl6ZUNhdGVnb3J5KCk7XG5cdFx0XHR0aGlzLnNldEV2ZW50cygpO1xuXHRcdFx0dGhpcy5zZXRWYWxpZGF0aW9ucygpO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgcGxhbm5pbmdBY3Rpb25CYXIgPSB7XG5cdFx0LyoqXG5cdFx0ICogRmFjdG9yeVxuXHRcdCovXG5cdFx0ZmFjdG9yeTogZnVuY3Rpb24ob2JqKSB7XG5cdFx0XHRBY3Rpb25CYXIucHJvdG90eXBlID0ge1xuXHRcdFx0XHQuLi5tb2RlbCxcblx0XHRcdFx0Li4uY29udHJvbGxlcixcblx0XHRcdFx0Li4udmlldyxcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBuZXcgQWN0aW9uQmFyKG9iaik7IFxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6IGZ1bmN0aW9uKHsgcGFyZW50LCBzZXR0aW5ncyAsIHRvdGFsLCBjYXRlZ29yeX0pIHtcblx0XHRcdHZhciBpbml0U2V0dGluZ3MgPSB7XG5cdFx0XHRcdHBhcmVudCxcblx0XHRcdFx0Li4uc2V0dGluZ3MsXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgIGFjdGlvbkJhciA9IHRoaXMuZmFjdG9yeShpbml0U2V0dGluZ3MpO1xuXHRcdFx0YWN0aW9uQmFyLmluaXQoeyB0b3RhbCwgY2F0ZWdvcnkgfSk7XG5cdFx0fSxcblx0fTtcblxuXHRyZXR1cm4gcGxhbm5pbmdBY3Rpb25CYXI7XG59KTsiXSwic291cmNlUm9vdCI6IiJ9