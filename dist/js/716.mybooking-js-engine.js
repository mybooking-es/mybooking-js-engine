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
		/**
		 * Set category
		*/
		setCategory: function(event){
			var value = $(event.currentTarget).val();

			this.model.parent.model.category = value;

			var target = document.getElementById(this.model.parent.model.target);
			target.dispatchEvent(new CustomEvent('refresh', { detail: { callback: this.refresh.bind(this) }} ));
		},

		/**
		 * Initialize category
		*/
		initializeCategory: function(){
			var categorySelector = $('#' + this.model.target + ' select[name=category]');

			this.model.parent.model.categories.forEach(function(item) {
				categorySelector.append('<option value="' + item.id + '">' + item.name + '</option>')
			});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcGxhbm5pbmdBY3Rpb25CYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBNEIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFnQixFQUFFLHlCQUFnQjtBQUN6RSxPQUFPLHdCQUFRLEVBQUUseUJBQWMsRUFBRSx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUMxRixPQUFPLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN0RixPQUFPLHlCQUFpQyxDQUFDLG1DQUNsQzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsOENBQThDO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0RBQW9ELFVBQVUscUNBQXFDO0FBQ25HLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSTtBQUNKLEdBQUc7O0FBRUgscUJBQXFCLGtCQUFrQjtBQUN2QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSixHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDLGlCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isb0NBQW9DO0FBQ3REO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CLGtCQUFrQjtBQUNyQyxHQUFHO0FBQ0g7O0FBRUE7QUFDQSxDQUFDO0FBQUEsa0dBQUMsQyIsImZpbGUiOiI3MTYubXlib29raW5nLWpzLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgncGxhbm5pbmdBY3Rpb25CYXInLCBbJ2pxdWVyeScsICdZU0RFdmVudFRhcmdldCcsICdjb21tb25TZXR0aW5ncycsXG4gICAgICAgJ21vbWVudCcsICdZU0RGb3JtYXR0ZXInLCAnanF1ZXJ5LnZhbGlkYXRlJywgJ2pxdWVyeS51aScsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1lcycsXG4gICAgICAgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVuJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWNhJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWl0JyxcbiAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXIudmFsaWRhdGlvbiddLFxuICAgICAgIGZ1bmN0aW9uKCQsIFlTREV2ZW50VGFyZ2V0LCBjb21tb25TZXR0aW5ncywgbW9tZW50LCBZU0RGb3JtYXR0ZXIpIHtcblxuXHQvKipcblx0ICogQ29udHJ1Y3RvclxuXHQqL1xuXHRmdW5jdGlvbiBBY3Rpb25CYXIoeyB0YXJnZXQsIHBhcmVudCwgY29sdW1uc1dpZHRoLCBjb2x1bW5zVG90YWwgIH0pIHtcblx0XHQvKipcblx0XHQgKiBQbGFubmluZ0FjdGlvbkJhciBkYXRhIG1vZGVsXG5cdFx0Ki9cblx0XHR0aGlzLm1vZGVsID0ge1xuXHRcdFx0cGFyZW50LFxuXHRcdFx0dGFyZ2V0OiB0YXJnZXQgfHzCoCdteWJvb2tpbmctaGVhZCcsXG5cdFx0XHRjb2x1bW5zOiB7XG5cdFx0XHRcdHdpZHRoOiBjb2x1bW5zV2lkdGggfHzCoDE1MCxcblx0XHRcdFx0dmlzaWJsZXM6IDAsXG5cdFx0XHRcdGFjdHVhbE1hcmdpbjogMCxcblx0XHRcdFx0dG90YWw6IDAsXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdHZhciBtb2RlbCA9IHtcblx0fTtcblxuXHR2YXIgY29udHJvbGxlciA9IHtcblx0XHQvKipcblx0XHQgKiBTZXQgY2F0ZWdvcnlcblx0XHQqL1xuXHRcdHNldENhdGVnb3J5OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHR2YXIgdmFsdWUgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpO1xuXG5cdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yeSA9IHZhbHVlO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0KTtcblx0XHRcdHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgncmVmcmVzaCcsIHsgZGV0YWlsOiB7IGNhbGxiYWNrOiB0aGlzLnJlZnJlc2guYmluZCh0aGlzKSB9fSApKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZSBjYXRlZ29yeVxuXHRcdCovXG5cdFx0aW5pdGlhbGl6ZUNhdGVnb3J5OiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSAkKCcjJyArIHRoaXMubW9kZWwudGFyZ2V0ICsgJyBzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblxuXHRcdFx0dGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0Y2F0ZWdvcnlTZWxlY3Rvci5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgaXRlbS5pZCArICdcIj4nICsgaXRlbS5uYW1lICsgJzwvb3B0aW9uPicpXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IG5ldyBkYXRlIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRzZXREYXRlOiAgZnVuY3Rpb24ocGFyYW1EYXRlKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCA9IHBhcmFtRGF0ZTtcblxuXHRcdFx0dmFyIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldCk7XG5cdFx0XHR0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3JlZnJlc2gnLCB7IGRldGFpbDogeyBjYWxsYmFjazogdGhpcy5yZWZyZXNoLmJpbmQodGhpcykgfX0gKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgYW5kIHJlZnJlc2ggcGxhbm5pbmdcblx0XHQqL1xuXHRcdGluaXRpYWxpemVEYXRlOiBmdW5jdGlvbihwYXJhbURhdGUpIHtcblx0XHRcdCQuZGF0ZXBpY2tlci5zZXREZWZhdWx0cyggJC5kYXRlcGlja2VyLnJlZ2lvbmFsW2NvbW1vblNldHRpbmdzLmxhbmd1YWdlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5sYW5nKSB8fMKgJ2VzJ10gKTtcblx0XHRcdFxuXHRcdFx0dmFyIGlucHV0RGF0ZSA9ICQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIGlucHV0W25hbWU9ZGF0ZV0nKTtcblx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKHtcblx0XHRcdFx0bWluRGF0ZTogdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwsXG5cdFx0XHR9KTtcblxuXHRcdFx0aW5wdXREYXRlLmRhdGVwaWNrZXIoJ3NldERhdGUnLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdCQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIGlucHV0W25hbWU9ZGF0ZV0nKS5vZmYoJ2NoYW5nZScpO1xuXHRcdFx0JCgnIycgKyB0aGlzLm1vZGVsLnRhcmdldCArICcgaW5wdXRbbmFtZT1kYXRlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKS5kYXRlcGlja2VyKCdnZXREYXRlJyk7XG5cblx0XHRcdFx0dGhhdC5zZXREYXRlKHZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRyZWZyZXNoOiBmdW5jdGlvbih7IHRvdGFsLCBjYXRlZ29yeSB9KSB7XG5cdFx0XHRpZiAodG90YWwgPiAwKSB7XG5cdFx0XHRcdHRoaXMuc2V0Q29sdW1ucyh0b3RhbCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGUoKTtcblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdCQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIHNlbGVjdFtuYW1lPWNhdGVnb3J5XScpLnZhbChjYXRlZ29yeSk7XG5cdFx0fSxcblx0fTtcblxuXHR2YXIgdmlldyA9IHtcblx0XHQvKipcblx0XHQgKiBTZXQgY29sdW1ucyB3aWR0aCBhbmQgZml4IGNvbnRhaW5lciB0byBzaG93IGNvbXBsZXRlIGNvbHVtbnNcblx0XHQqL1xuXHRcdHNldENvbHVtbnM6IGZ1bmN0aW9uKHRvdGFsKSB7XG5cdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwgPSB0b3RhbDtcblxuXHRcdFx0dmFyIHRhcmdldCA9ICQoJyMnICsgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0KTtcblx0XHRcdHZhciBjb250YWluZXIgPSAkKHRhcmdldCkuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlJyk7XG5cdFx0XHR2YXIgdGhzID0gJCh0YXJnZXQpLmZpbmQoJ3RoZWFkIHRoOm5vdCgubXlib29raW5nLXBsYW5uaW5nLXRkLWZpeCknKTtcblx0XHRcdHZhciB0ZHMgPSAkKHRhcmdldCkuZmluZCgndGJvZHkgdGQnKTtcblx0XHRcdHZhciBjb250YWluZXJXaWR0aCA9ICQoJyMnICsgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0KS5jbG9zZXN0KCcubXlib29raW5nLXBsYW5uaW5nLXRhYmxlLWNvbnRlbnQnKS53aWR0aCgpIC0gd2luZG93LnBhcnNlSW50KGNvbnRhaW5lci5jc3MoJ21hcmdpbi1sZWZ0JykpO1xuXG5cdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgPSBNYXRoLmZsb29yKGNvbnRhaW5lcldpZHRoIC8gdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoKTtcblxuXHRcdFx0aWYgKHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcyA+IHRoaXMubW9kZWwuY29sdW1ucy50b3RhbCkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgPSB0aGlzLm1vZGVsLmNvbHVtbnMudG90YWw7XG5cdFx0XHR9XG5cblx0XHRcdHRocy5jc3MoJ3dpZHRoJywgdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoICsgJ3B4JyApO1xuXHRcdFx0dGRzLmNzcygnd2lkdGgnLCB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggKyAncHgnICk7XG5cdFx0XHRjb250YWluZXIuY3NzKCd3aWR0aCcsICh0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGgpICsgJ3B4Jyk7XG5cdFx0XHRcblx0XHRcdGlmICh0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwgKiB0aGlzLm1vZGVsLmNvbHVtbnMud2lkdGggPiB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luICogLTEpe1xuXHRcdFx0XHRjb250YWluZXIuZmluZCgndGFibGUnKS5jc3MoJ21hcmdpbi1sZWZ0JywgdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFNjcm9sbCBjYWxlbmRhclxuXHRcdCovXG5cdFx0c2V0U2Nyb2xsQ2FsZW5kYXJCdXR0b25zU3RhdGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgZGF0ZUJ1dHRvbnMgPSAkKCcjJyArIHRoaXMubW9kZWwudGFyZ2V0ICsgJyBidXR0b25bZGF0YS1hY3Rpb249ZGF0ZV0nKTtcblx0XHRcdHZhciBmaXJzdERhdGUgPSBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2FsZW5kYXJbMF0pLmFkZCgxLCAnZCcpO1xuXHRcdFx0dmFyIGxhc3REYXRlID0gbW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLnNsaWNlKC0xKS5wb3AoKSkuc3VidHJhY3QoMSwgJ2QnKTtcblxuXHRcdFx0aWYobW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKS5pc0JlZm9yZShmaXJzdERhdGUpKSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzBdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdFx0aWYobW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKS5pc0FmdGVyKGxhc3REYXRlKSkge1xuXHRcdFx0XHQkKGRhdGVCdXR0b25zWzFdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChkYXRlQnV0dG9uc1sxXSkucmVtb3ZlQXR0cignZGlzYWJsZWQnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHNjcm9sbENhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYWxlbmRhci5sZW5ndGggPiAwKXtcblx0XHRcdFx0dmFyIGRhdGUgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbDtcblxuXHRcdFx0XHR2YXIgZmlyc3REYXRlID0gbW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyWzBdKTtcblx0XHRcdFx0dmFyIGxhc3REYXRlID0gbW9tZW50KHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLnNsaWNlKC0xKS5wb3AoKSk7XG5cblx0XHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdFx0dmFyIG5ld0RhdGUgPSBtb21lbnQoZGF0ZSkuYWRkKDEsICdkJyk7XG5cdFx0XHRcdFx0dmFyIGluZGV4MSA9IDE7XG5cblx0XHRcdFx0XHR3aGlsZSAoaW5kZXgxIDwgNjAgJiYgbmV3RGF0ZS5pc0JlZm9yZShsYXN0RGF0ZSkpIHtcblx0XHRcdFx0XHRcdHZhciBmb3JtYXRlRGF0ZSA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKG5ld0RhdGUsIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmFwaV9kYXRlX2Zvcm1hdCk7XG5cdFx0XHRcdFx0XHR2YXIgbmV3SW5zdGFuY2VEYXRlID0gbmV3IERhdGUoZm9ybWF0ZURhdGUpO1xuXHRcdFxuXHRcdFx0XHRcdFx0dmFyIGlzSW5jbHVkZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmluY2x1ZGVzKGZvcm1hdGVEYXRlKTtcblx0XHRcdFx0XHRcdGlmIChpc0luY2x1ZGUpe1xuXHRcdFx0XHRcdFx0XHR2YXIgaW5wdXREYXRlID0gJCgnIycgKyB0aGlzLm1vZGVsLnRhcmdldCArICcgaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0RGF0ZShuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGluZGV4MSArPSAxO1xuXHRcdFx0XHRcdFx0bmV3RGF0ZSA9IG1vbWVudChkYXRlKS5hZGQoaW5kZXgxLCAnZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdiYWNrJykge1xuXHRcdFx0XHRcdHZhciBuZXdEYXRlID0gbW9tZW50KGRhdGUpLnN1YnRyYWN0KDEsICdkJyk7XG5cdFx0XHRcdFx0dmFyIGluZGV4MiA9IDE7XG5cblx0XHRcdFx0XHR3aGlsZSAoaW5kZXgyIDwgNjAgJiYgbmV3RGF0ZS5pc0FmdGVyKGZpcnN0RGF0ZSkpIHtcblx0XHRcdFx0XHRcdHZhciBmb3JtYXRlRGF0ZSA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKG5ld0RhdGUsIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmFwaV9kYXRlX2Zvcm1hdCk7XG5cdFx0XHRcdFx0XHR2YXIgbmV3SW5zdGFuY2VEYXRlID0gbmV3IERhdGUoZm9ybWF0ZURhdGUpO1xuXHRcdFxuXHRcdFx0XHRcdFx0dmFyIGlzSW5jbHVkZSA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhbGVuZGFyLmluY2x1ZGVzKGZvcm1hdGVEYXRlKTtcblx0XHRcdFx0XHRcdGlmIChpc0luY2x1ZGUpe1xuXHRcdFx0XHRcdFx0XHR2YXIgaW5wdXREYXRlID0gJCgnIycgKyB0aGlzLm1vZGVsLnRhcmdldCArICcgaW5wdXRbbmFtZT1kYXRlXScpO1xuXHRcdFx0XHRcdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIG5ld0luc3RhbmNlRGF0ZSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0RGF0ZShuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGluZGV4MiArPSAxO1xuXHRcdFx0XHRcdFx0bmV3RGF0ZSA9IG1vbWVudChkYXRlKS5zdWJ0cmFjdChpbmRleDIsICdkJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEhvcml6b250YWwgc2Nyb2xsXG5cdFx0Ki9cblx0XHRzZXRTY3JvbGxCdXR0b25zU3RhdGU6IGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwsIHRoaXMubW9kZWwuY29sdW1ucy52aXNpYmxlcywgdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoKTtcblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luO1xuXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9ICQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIGJ1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdGlmIChhY3R1YWxNYXJnaW4gPj0gMCkge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgoYWN0dWFsTWFyZ2luICogLTEpID49ICgodGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsIC0gdGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzKSAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCkpIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c2Nyb2xsOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdHZhciBjb250YWluZXIgPSAkKCcjJyArIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldCkuZmluZCgnLm15Ym9va2luZy1wbGFubmluZy1zY3JvbGxhYmxlIHRhYmxlJyk7XG5cblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSAwO1xuXHRcdFx0aWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG5cdFx0XHRcdGFjdHVhbE1hcmdpbiA9IHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4gKyAgKHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCAqIC0xKTtcblx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnYmFjaycpIHtcblx0XHRcdFx0YWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiArIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiA9IGFjdHVhbE1hcmdpbjtcblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cblx0XHRcdGNvbnRhaW5lci5hbmltYXRlKHtcblx0XHRcdFx0bWFyZ2luTGVmdDogdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbixcblx0XHRcdH0sIHtcblx0XHRcdFx0ZHVyYXRpb246IDEwMDBcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBFdmVudHNcblx0XHQqL1xuXHRcdHNldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvKlxuXHRcdFx0KiBCdXR0b24gbmV4dCBldmVudHNcblx0XHRcdCovXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9ICQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIGJ1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdHRoaXMuc2V0U2Nyb2xsQnV0dG9uc1N0YXRlKCk7XG5cdFx0XHRzY3JvbGxCdXR0b25zLm9mZignY2xpY2snKTtcblx0XHRcdHNjcm9sbEJ1dHRvbnMub24oJ2NsaWNrJywgdGhpcy5zY3JvbGwuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhdGVnb3J5IHNlbGVjdG9yXG5cdFx0XHQqL1xuXHRcdFx0dmFyIGNhdGVnb3J5U2VsZWN0b3IgPSAkKCcjJyArIHRoaXMubW9kZWwudGFyZ2V0ICsgJyBzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdGNhdGVnb3J5U2VsZWN0b3Iub24oJ2NoYW5nZScsIHRoaXMuc2V0Q2F0ZWdvcnkuYmluZCh0aGlzKSk7XG5cblx0XHRcdC8qXG5cdFx0XHQqIENhbGVuZGFyIHNjcm9sbFxuXHRcdFx0Ki9cblx0XHRcdHZhciBkYXRlQnV0dG9ucyA9ICQoJyMnICsgdGhpcy5tb2RlbC50YXJnZXQgKyAnIGJ1dHRvbltkYXRhLWFjdGlvbj1kYXRlXScpO1xuXG5cdFx0XHRkYXRlQnV0dG9ucy5vZmYoJ2NsaWNrJyk7XG5cdFx0XHRkYXRlQnV0dG9ucy5vbignY2xpY2snLCB0aGlzLnNjcm9sbENhbGVuZGFyLmJpbmQodGhpcykpO1xuXHRcdH0sXG5cblx0XHRzZXRWYWxpZGF0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcjJyArIHRoaXMubW9kZWwudGFyZ2V0KS52YWxpZGF0ZSh7XG5cdFx0XHRcdHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0sIGV2ZW50KSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVsZXM6IHsgICAgICAgICBcblx0XHRcdFx0fSxcblx0XHRcdFx0bWVzc2FnZXM6IHtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge1xuXHRcdFx0XHRcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvckNsYXNzIDogJ2Zvcm0tcmVzZXJ2YXRpb24tZXJyb3InXG5cdFx0IH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6ICBmdW5jdGlvbiAoeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0dGhpcy5yZWZyZXNoKHsgdG90YWwsIGNhdGVnb3J5IH0pO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplRGF0ZSgpO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplQ2F0ZWdvcnkoKTtcblx0XHRcdHRoaXMuc2V0RXZlbnRzKCk7XG5cdFx0XHR0aGlzLnNldFZhbGlkYXRpb25zKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBwbGFubmluZ0FjdGlvbkJhciA9IHtcblx0XHQvKipcblx0XHQgKiBGYWN0b3J5XG5cdFx0Ki9cblx0XHRmYWN0b3J5OiBmdW5jdGlvbihvYmopIHtcblx0XHRcdEFjdGlvbkJhci5wcm90b3R5cGUgPSB7XG5cdFx0XHRcdC4uLm1vZGVsLFxuXHRcdFx0XHQuLi5jb250cm9sbGVyLFxuXHRcdFx0XHQuLi52aWV3LFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIG5ldyBBY3Rpb25CYXIob2JqKTsgXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpemlhbGl6ZVxuXHRcdCovXG5cdFx0aW5pdDogZnVuY3Rpb24oeyBwYXJlbnQsIHNldHRpbmdzICwgdG90YWwsIGNhdGVnb3J5fSkge1xuXHRcdFx0dmFyIGluaXRTZXR0aW5ncyA9IHtcblx0XHRcdFx0cGFyZW50LFxuXHRcdFx0XHQuLi5zZXR0aW5ncyxcblx0XHRcdH07XG5cblx0XHRcdHZhciAgYWN0aW9uQmFyID0gdGhpcy5mYWN0b3J5KGluaXRTZXR0aW5ncyk7XG5cdFx0XHRhY3Rpb25CYXIuaW5pdCh7IHRvdGFsLCBjYXRlZ29yeSB9KTtcblx0XHR9LFxuXHR9O1xuXG5cdHJldHVybiBwbGFubmluZ0FjdGlvbkJhcjtcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=