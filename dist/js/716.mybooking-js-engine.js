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
					categorySelector.append('<option value="' + item.id + '">' + item.name + '</option>')
				});
			} else {
				categorySelector.attr('disabled', 'disabled');
			}
		},

		/**
		 * Set new date and refresh planning
		*/
		setDate:  function(paramDate) {
			this.model.parent.model.date.actual = paramDate;

			var target = document.getElementById(this.model.parent.model.targetId);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize and refresh planning
		*/
		initializeDate: function(paramDate) {
			$.datepicker.setDefaults( $.datepicker.regional[commonSettings.language(document.documentElement.lang) || 'es'] );
			
			var inputDate = this.model.target.find('input[name=date]');
			inputDate.datepicker({
				minDate: this.model.parent.model.date.actual,
			});

			inputDate.datepicker('setDate', this.model.parent.model.date.actual);

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

			if (this.model.parent.model.calendar.length > 0) {
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
							var inputDate = this.model.target.find('input[name=date]');
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
							var inputDate = this.model.target.find('input[name=date]');
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

			if (this.model.parent.model.calendar.length > 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcGxhbm5pbmdBY3Rpb25CYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBNEIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFnQixFQUFFLHlCQUFnQjtBQUN6RSxPQUFPLHdCQUFRLEVBQUUseUJBQWMsRUFBRSx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUMxRixPQUFPLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN0RixPQUFPLHlCQUFpQyxDQUFDLG1DQUNsQzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUNBQXVDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9EQUFvRCxVQUFVLHFDQUFxQztBQUNuRyxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVILHFCQUFxQixrQkFBa0I7QUFDdkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFk7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEMsaUJBQWlCLGtCQUFrQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkI7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixvQ0FBb0M7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDLEdBQUc7QUFDSDs7QUFFQTtBQUNBLENBQUM7QUFBQSxrR0FBQyxDIiwiZmlsZSI6IjcxNi5teWJvb2tpbmctanMtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKCdwbGFubmluZ0FjdGlvbkJhcicsIFsnanF1ZXJ5JywgJ1lTREV2ZW50VGFyZ2V0JywgJ2NvbW1vblNldHRpbmdzJyxcbiAgICAgICAnbW9tZW50JywgJ1lTREZvcm1hdHRlcicsICdqcXVlcnkudmFsaWRhdGUnLCAnanF1ZXJ5LnVpJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVzJyxcbiAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItZW4nLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItY2EnLCAnanF1ZXJ5LnVpLmRhdGVwaWNrZXItaXQnLFxuICAgICAgICdqcXVlcnkudWkuZGF0ZXBpY2tlci52YWxpZGF0aW9uJ10sXG4gICAgICAgZnVuY3Rpb24oJCwgWVNERXZlbnRUYXJnZXQsIGNvbW1vblNldHRpbmdzLCBtb21lbnQsIFlTREZvcm1hdHRlcikge1xuXG5cdC8qKlxuXHQgKiBDb250cnVjdG9yXG5cdCovXG5cdGZ1bmN0aW9uIEFjdGlvbkJhcih7IHRhcmdldCwgcGFyZW50LCBjb2x1bW5zV2lkdGgsIHRvdGFsICB9KSB7XG5cdFx0LyoqXG5cdFx0ICogUGxhbm5pbmdBY3Rpb25CYXIgZGF0YSBtb2RlbFxuXHRcdCovXG5cdFx0dGhpcy5tb2RlbCA9IHtcblx0XHRcdHBhcmVudCxcblx0XHRcdHRhcmdldCxcblx0XHRcdGNvbHVtbnM6IHtcblx0XHRcdFx0d2lkdGg6IGNvbHVtbnNXaWR0aCB8fMKgMTUwLFxuXHRcdFx0XHR2aXNpYmxlczogMCxcblx0XHRcdFx0YWN0dWFsTWFyZ2luOiAwLFxuXHRcdFx0XHR0b3RhbDogMCxcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0dmFyIG1vZGVsID0ge1xuXHR9O1xuXG5cdHZhciBjb250cm9sbGVyID0ge1xuXHRcdC8qKlxuXHRcdCAqIFNldCBjYXRlZ29yeVxuXHRcdCovXG5cdFx0c2V0Q2F0ZWdvcnk6IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdHZhciB2YWx1ZSA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkudmFsKCk7XG5cblx0XHRcdHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhdGVnb3J5ID0gdmFsdWU7XG5cblx0XHRcdHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXRJZCk7XG5cdFx0XHR0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlZnJlc2gnLCB7IGRldGFpbDogeyBjYWxsYmFjazogdGhpcy5yZWZyZXNoLmJpbmQodGhpcykgfX0gKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgY2F0ZWdvcnlcblx0XHQqL1xuXHRcdGluaXRpYWxpemVDYXRlZ29yeTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBjYXRlZ29yeVNlbGVjdG9yID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnc2VsZWN0W25hbWU9Y2F0ZWdvcnldJyk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0XHRjYXRlZ29yeVNlbGVjdG9yLmFwcGVuZCgnPG9wdGlvbiB2YWx1ZT1cIicgKyBpdGVtLmlkICsgJ1wiPicgKyBpdGVtLm5hbWUgKyAnPC9vcHRpb24+Jylcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjYXRlZ29yeVNlbGVjdG9yLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBuZXcgZGF0ZSBhbmQgcmVmcmVzaCBwbGFubmluZ1xuXHRcdCovXG5cdFx0c2V0RGF0ZTogIGZ1bmN0aW9uKHBhcmFtRGF0ZSkge1xuXHRcdFx0dGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwgPSBwYXJhbURhdGU7XG5cblx0XHRcdHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXRJZCk7XG5cdFx0XHR0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlZnJlc2gnLCB7IGRldGFpbDogeyBjYWxsYmFjazogdGhpcy5yZWZyZXNoLmJpbmQodGhpcykgfX0gKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgYW5kIHJlZnJlc2ggcGxhbm5pbmdcblx0XHQqL1xuXHRcdGluaXRpYWxpemVEYXRlOiBmdW5jdGlvbihwYXJhbURhdGUpIHtcblx0XHRcdCQuZGF0ZXBpY2tlci5zZXREZWZhdWx0cyggJC5kYXRlcGlja2VyLnJlZ2lvbmFsW2NvbW1vblNldHRpbmdzLmxhbmd1YWdlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nKSB8fMKgJ2VzJ10gKTtcblx0XHRcdFxuXHRcdFx0dmFyIGlucHV0RGF0ZSA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKTtcblx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKHtcblx0XHRcdFx0bWluRGF0ZTogdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwsXG5cdFx0XHR9KTtcblxuXHRcdFx0aW5wdXREYXRlLmRhdGVwaWNrZXIoJ3NldERhdGUnLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKS5vZmYoJ2NoYW5nZScpO1xuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQuZmluZCgnaW5wdXRbbmFtZT1kYXRlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKS5kYXRlcGlja2VyKCdnZXREYXRlJyk7XG5cblx0XHRcdFx0dGhhdC5zZXREYXRlKHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRyZWZyZXNoOiBmdW5jdGlvbih7IHRvdGFsLCBjYXRlZ29yeSB9KSB7XG5cdFx0XHRpZiAodG90YWwgPiAwKSB7XG5cdFx0XHRcdHRoaXMuc2V0Q29sdW1ucyh0b3RhbCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYWxlbmRhci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuc2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRTY3JvbGxCdXR0b25zU3RhdGUoKTtcblxuXHRcdFx0dGhpcy5tb2RlbC50YXJnZXQuZmluZCgnc2VsZWN0W25hbWU9Y2F0ZWdvcnldJykudmFsKGNhdGVnb3J5KTtcblx0XHR9LFxuXHR9O1xuXG5cdHZhciB2aWV3ID0ge1xuXHRcdC8qKlxuXHRcdCAqIFNldCBjb2x1bW5zIHdpZHRoIGFuZCBmaXggY29udGFpbmVyIHRvIHNob3cgY29tcGxldGUgY29sdW1uc1xuXHRcdCovXG5cdFx0c2V0Q29sdW1uczogZnVuY3Rpb24odG90YWwpIHtcblx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCA9IHRvdGFsO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0O1xuXHRcdFx0dmFyIGNvbnRhaW5lciA9ICQodGFyZ2V0KS5maW5kKCcubXlib29raW5nLXBsYW5uaW5nLXNjcm9sbGFibGUnKTtcblx0XHRcdHZhciB0aHMgPSAkKHRhcmdldCkuZmluZCgndGhlYWQgdGg6bm90KC5teWJvb2tpbmctcGxhbm5pbmctdGQtZml4KScpO1xuXHRcdFx0dmFyIHRkcyA9ICQodGFyZ2V0KS5maW5kKCd0Ym9keSB0ZCcpO1xuXHRcdFx0dmFyIGNvbnRhaW5lcldpZHRoID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0LmNsb3Nlc3QoJy5teWJvb2tpbmctcGxhbm5pbmctY29udGVudCcpLndpZHRoKCkgLSB3aW5kb3cucGFyc2VJbnQoY29udGFpbmVyLmNzcygnbWFyZ2luLWxlZnQnKSk7XG5cblx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA9IE1hdGguZmxvb3IoY29udGFpbmVyV2lkdGggLyB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzID4gdGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsKSB7XG5cdFx0XHRcdHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA9IHRoaXMubW9kZWwuY29sdW1ucy50b3RhbDtcblx0XHRcdH1cblxuXHRcdFx0dGhzLmNzcygnd2lkdGgnLCB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggKyAncHgnICk7XG5cdFx0XHR0ZHMuY3NzKCd3aWR0aCcsIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCArICdweCcgKTtcblx0XHRcdGNvbnRhaW5lci5jc3MoJ3dpZHRoJywgKHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCkgKyAncHgnKTtcblx0XHRcdFxuXHRcdFx0aWYgKHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCA+IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKiAtMSl7XG5cdFx0XHRcdGNvbnRhaW5lci5maW5kKCd0YWJsZScpLmNzcygnbWFyZ2luLWxlZnQnLCB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU2Nyb2xsIGNhbGVuZGFyXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxDYWxlbmRhckJ1dHRvbnNTdGF0ZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXHRcdFx0dmFyIGZpcnN0RGF0ZSA9IG1vbWVudCh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYWxlbmRhclswXSkuYWRkKDEsICdkJyk7XG5cdFx0XHR2YXIgbGFzdERhdGUgPSBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIuc2xpY2UoLTEpLnBvcCgpKS5zdWJ0cmFjdCgxLCAnZCcpO1xuXG5cdFx0XHRpZihtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpLmlzQmVmb3JlKGZpcnN0RGF0ZSkpIHtcblx0XHRcdFx0JChkYXRlQnV0dG9uc1swXSkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMF0pLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cdFx0XHRpZihtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpLmlzQWZ0ZXIobGFzdERhdGUpKSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMV0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzFdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c2Nyb2xsQ2FsZW5kYXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRcdHZhciBkaXJlY3Rpb24gPSB0YXJnZXQuYXR0cignZGF0YS1kaXJlY3Rpb24nKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmxlbmd0aCA+IDApe1xuXHRcdFx0XHR2YXIgZGF0ZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsO1xuXG5cdFx0XHRcdHZhciBmaXJzdERhdGUgPSBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXJbMF0pO1xuXHRcdFx0XHR2YXIgbGFzdERhdGUgPSBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIuc2xpY2UoLTEpLnBvcCgpKTtcblxuXHRcdFx0XHRpZiAoZGlyZWN0aW9uID09PSAnbmV4dCcpIHtcblx0XHRcdFx0XHR2YXIgbmV3RGF0ZSA9IG1vbWVudChkYXRlKS5hZGQoMSwgJ2QnKTtcblx0XHRcdFx0XHR2YXIgaW5kZXgxID0gMTtcblxuXHRcdFx0XHRcdHdoaWxlIChpbmRleDEgPCA2MCAmJiBuZXdEYXRlLmlzQmVmb3JlKGxhc3REYXRlKSkge1xuXHRcdFx0XHRcdFx0dmFyIGZvcm1hdGVEYXRlID0gWVNERm9ybWF0dGVyLmZvcm1hdERhdGUobmV3RGF0ZSwgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuYXBpX2RhdGVfZm9ybWF0KTtcblx0XHRcdFx0XHRcdHZhciBuZXdJbnN0YW5jZURhdGUgPSBuZXcgRGF0ZShmb3JtYXRlRGF0ZSk7XG5cdFx0XG5cdFx0XHRcdFx0XHR2YXIgaXNJbmNsdWRlID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIuaW5jbHVkZXMoZm9ybWF0ZURhdGUpO1xuXHRcdFx0XHRcdFx0aWYgKGlzSW5jbHVkZSl7XG5cdFx0XHRcdFx0XHRcdHZhciBpbnB1dERhdGUgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJyk7XG5cdFx0XHRcdFx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKCdzZXREYXRlJywgbmV3SW5zdGFuY2VEYXRlKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZXREYXRlKG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aW5kZXgxICs9IDE7XG5cdFx0XHRcdFx0XHRuZXdEYXRlID0gbW9tZW50KGRhdGUpLmFkZChpbmRleDEsICdkJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2JhY2snKSB7XG5cdFx0XHRcdFx0dmFyIG5ld0RhdGUgPSBtb21lbnQoZGF0ZSkuc3VidHJhY3QoMSwgJ2QnKTtcblx0XHRcdFx0XHR2YXIgaW5kZXgyID0gMTtcblxuXHRcdFx0XHRcdHdoaWxlIChpbmRleDIgPCA2MCAmJiBuZXdEYXRlLmlzQWZ0ZXIoZmlyc3REYXRlKSkge1xuXHRcdFx0XHRcdFx0dmFyIGZvcm1hdGVEYXRlID0gWVNERm9ybWF0dGVyLmZvcm1hdERhdGUobmV3RGF0ZSwgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuYXBpX2RhdGVfZm9ybWF0KTtcblx0XHRcdFx0XHRcdHZhciBuZXdJbnN0YW5jZURhdGUgPSBuZXcgRGF0ZShmb3JtYXRlRGF0ZSk7XG5cdFx0XG5cdFx0XHRcdFx0XHR2YXIgaXNJbmNsdWRlID0gdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIuaW5jbHVkZXMoZm9ybWF0ZURhdGUpO1xuXHRcdFx0XHRcdFx0aWYgKGlzSW5jbHVkZSl7XG5cdFx0XHRcdFx0XHRcdHZhciBpbnB1dERhdGUgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJyk7XG5cdFx0XHRcdFx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKCdzZXREYXRlJywgbmV3SW5zdGFuY2VEYXRlKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZXREYXRlKG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5kZXgyICs9IDE7XG5cdFx0XHRcdFx0XHRuZXdEYXRlID0gbW9tZW50KGRhdGUpLnN1YnRyYWN0KGluZGV4MiwgJ2QnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSG9yaXpvbnRhbCBzY3JvbGxcblx0XHQqL1xuXHRcdHNldFNjcm9sbEJ1dHRvbnNTdGF0ZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luO1xuXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdGlmIChhY3R1YWxNYXJnaW4gPj0gMCkge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgoYWN0dWFsTWFyZ2luICogLTEpID49ICgodGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsIC0gdGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzKSAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCkpIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c2Nyb2xsOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdHZhciBjb250YWluZXIgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXQuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlIHRhYmxlJyk7XG5cblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSAwO1xuXHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdGFjdHVhbE1hcmdpbiA9IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKyAgKHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCAqIC0xKTtcblx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnYmFjaycpIHtcblx0XHRcdFx0YWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiArIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiA9IGFjdHVhbE1hcmdpbjtcblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdGNvbnRhaW5lci5hbmltYXRlKHtcblx0XHRcdFx0bWFyZ2luTGVmdDogdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbixcblx0XHRcdH0sIHtcblx0XHRcdFx0ZHVyYXRpb246IDEwMDBcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBFdmVudHNcblx0XHQqL1xuXHRcdHNldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvKlxuXHRcdFx0KiBCdXR0b24gbmV4dCBldmVudHNcblx0XHRcdCovXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cdFx0XHRzY3JvbGxCdXR0b25zLm9mZignY2xpY2snKTtcblx0XHRcdHNjcm9sbEJ1dHRvbnMub24oJ2NsaWNrJywgdGhpcy5zY3JvbGwuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhdGVnb3J5IHNlbGVjdG9yXG5cdFx0XHQqL1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub24oJ2NoYW5nZScsIHRoaXMuc2V0Q2F0ZWdvcnkuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhbGVuZGFyIHNjcm9sbFxuXHRcdFx0Ki9cblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5vZmYoJ2NsaWNrJyk7XG5cdFx0XHRcdGRhdGVCdXR0b25zLm9uKCdjbGljaycsIHRoaXMuc2Nyb2xsQ2FsZW5kYXIuYmluZCh0aGlzKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzZXRWYWxpZGF0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC52YWxpZGF0ZSh7XG5cdFx0XHRcdHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0sIGV2ZW50KSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVsZXM6IHsgICAgICAgICBcblx0XHRcdFx0fSxcblx0XHRcdFx0bWVzc2FnZXM6IHtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge1xuXHRcdFx0XHRcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvckNsYXNzIDogJ2Zvcm0tcmVzZXJ2YXRpb24tZXJyb3InXG5cdFx0IH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6ICBmdW5jdGlvbiAoeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0dGhpcy5yZWZyZXNoKHsgdG90YWwsIGNhdGVnb3J5IH0pO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplRGF0ZSgpO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplQ2F0ZWdvcnkoKTtcblx0XHRcdHRoaXMuc2V0RXZlbnRzKCk7XG5cdFx0XHR0aGlzLnNldFZhbGlkYXRpb25zKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBwbGFubmluZ0FjdGlvbkJhciA9IHtcblx0XHQvKipcblx0XHQgKiBGYWN0b3J5XG5cdFx0Ki9cblx0XHRmYWN0b3J5OiBmdW5jdGlvbihvYmopIHtcblx0XHRcdEFjdGlvbkJhci5wcm90b3R5cGUgPSB7XG5cdFx0XHRcdC4uLm1vZGVsLFxuXHRcdFx0XHQuLi5jb250cm9sbGVyLFxuXHRcdFx0XHQuLi52aWV3LFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIG5ldyBBY3Rpb25CYXIob2JqKTsgXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpemlhbGl6ZVxuXHRcdCovXG5cdFx0aW5pdDogZnVuY3Rpb24oeyBwYXJlbnQsIHNldHRpbmdzICwgdG90YWwsIGNhdGVnb3J5fSkge1xuXHRcdFx0dmFyIGluaXRTZXR0aW5ncyA9IHtcblx0XHRcdFx0cGFyZW50LFxuXHRcdFx0XHQuLi5zZXR0aW5ncyxcblx0XHRcdH07XG5cblx0XHRcdHZhciAgYWN0aW9uQmFyID0gdGhpcy5mYWN0b3J5KGluaXRTZXR0aW5ncyk7XG5cdFx0XHRhY3Rpb25CYXIuaW5pdCh7IHRvdGFsLCBjYXRlZ29yeSB9KTtcblx0XHR9LFxuXHR9O1xuXG5cdHJldHVybiBwbGFubmluZ0FjdGlvbkJhcjtcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=