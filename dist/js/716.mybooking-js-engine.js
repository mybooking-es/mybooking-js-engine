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

			if (typeof this.model.parent.model.category !== 'undefined'){
				categorySelector.closest('.field').css('display', 'block');
			}

			if (typeof this.model.parent.model.category !== 'undefined' && this.model.parent.model.categories.length > 0) {
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
			var firstDate = moment(new Date(this.model.parent.model.configuration.serverDate));

			if(moment(this.model.parent.model.date.actual).isSame(firstDate) || moment(this.model.parent.model.date.actual).isBefore(firstDate)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9teWJvb2tpbmctanMtZW5naW5lLy4vc3JjL3JlbnQvcGxhbm5pbmcvcGxhbm5pbmdBY3Rpb25CYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpR0FBNEIsQ0FBQyx5QkFBUSxFQUFFLHlCQUFnQixFQUFFLHlCQUFnQjtBQUN6RSxPQUFPLHdCQUFRLEVBQUUseUJBQWMsRUFBRSx5QkFBaUIsRUFBRSx5QkFBVyxFQUFFLHdCQUF5QjtBQUMxRixPQUFPLHlCQUF5QixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QjtBQUN0RixPQUFPLHlCQUFpQyxDQUFDLG1DQUNsQzs7QUFFUDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUNBQXVDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvREFBb0QsVUFBVSxxQ0FBcUM7QUFDbkcsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSCxxQkFBcUIsa0JBQWtCO0FBQ3ZDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJO0FBQ0osR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDLGlCQUFpQixrQkFBa0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isb0NBQW9DO0FBQ3REO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CLGtCQUFrQjtBQUNyQyxHQUFHO0FBQ0g7O0FBRUE7QUFDQSxDQUFDO0FBQUEsa0dBQUMsQyIsImZpbGUiOiI3MTYubXlib29raW5nLWpzLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgncGxhbm5pbmdBY3Rpb25CYXInLCBbJ2pxdWVyeScsICdZU0RFdmVudFRhcmdldCcsICdjb21tb25TZXR0aW5ncycsXG4gICAgICAgJ21vbWVudCcsICdZU0RGb3JtYXR0ZXInLCAnanF1ZXJ5LnZhbGlkYXRlJywgJ2pxdWVyeS51aScsICdqcXVlcnkudWkuZGF0ZXBpY2tlci1lcycsXG4gICAgICAgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWVuJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWNhJywgJ2pxdWVyeS51aS5kYXRlcGlja2VyLWl0JyxcbiAgICAgICAnanF1ZXJ5LnVpLmRhdGVwaWNrZXIudmFsaWRhdGlvbiddLFxuICAgICAgIGZ1bmN0aW9uKCQsIFlTREV2ZW50VGFyZ2V0LCBjb21tb25TZXR0aW5ncywgbW9tZW50LCBZU0RGb3JtYXR0ZXIpIHtcblxuXHQvKipcblx0ICogQ29udHJ1Y3RvclxuXHQqL1xuXHRmdW5jdGlvbiBBY3Rpb25CYXIoeyB0YXJnZXQsIHBhcmVudCwgY29sdW1uc1dpZHRoLCB0b3RhbCAgfSkge1xuXHRcdC8qKlxuXHRcdCAqIFBsYW5uaW5nQWN0aW9uQmFyIGRhdGEgbW9kZWxcblx0XHQqL1xuXHRcdHRoaXMubW9kZWwgPSB7XG5cdFx0XHRwYXJlbnQsXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRjb2x1bW5zOiB7XG5cdFx0XHRcdHdpZHRoOiBjb2x1bW5zV2lkdGggfHzCoDE1MCxcblx0XHRcdFx0dmlzaWJsZXM6IDAsXG5cdFx0XHRcdGFjdHVhbE1hcmdpbjogMCxcblx0XHRcdFx0dG90YWw6IDAsXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdHZhciBtb2RlbCA9IHtcblx0fTtcblxuXHR2YXIgY29udHJvbGxlciA9IHtcblx0XHQvKipcblx0XHQgKiBTZXQgY2F0ZWdvcnlcblx0XHQqL1xuXHRcdHNldENhdGVnb3J5OiBmdW5jdGlvbihldmVudCl7XG5cdFx0XHR2YXIgdmFsdWUgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLnZhbCgpO1xuXG5cdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yeSA9IHZhbHVlO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0SWQpO1xuXHRcdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZWZyZXNoJywgeyBkZXRhaWw6IHsgY2FsbGJhY2s6IHRoaXMucmVmcmVzaC5iaW5kKHRoaXMpIH19ICkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIGNhdGVnb3J5XG5cdFx0Ki9cblx0XHRpbml0aWFsaXplQ2F0ZWdvcnk6IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgY2F0ZWdvcnlTZWxlY3RvciA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ3NlbGVjdFtuYW1lPWNhdGVnb3J5XScpO1xuXG5cdFx0XHRpZiAodHlwZW9mIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhdGVnb3J5ICE9PSAndW5kZWZpbmVkJyl7XG5cdFx0XHRcdGNhdGVnb3J5U2VsZWN0b3IuY2xvc2VzdCgnLmZpZWxkJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgdGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuY2F0ZWdvcnkgIT09ICd1bmRlZmluZWQnICYmIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5jYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRcdGNhdGVnb3J5U2VsZWN0b3IuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGl0ZW0uY29kZSArICdcIj4nICsgaXRlbS5uYW1lICsgJzwvb3B0aW9uPicpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2F0ZWdvcnlTZWxlY3Rvci5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTZXQgbmV3IGRhdGUgYW5kIHJlZnJlc2ggcGxhbm5pbmdcblx0XHQqL1xuXHRcdHNldERhdGU6ICBmdW5jdGlvbihwYXJhbURhdGUpIHtcblx0XHRcdHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsID0gWVNERm9ybWF0dGVyLmZvcm1hdERhdGUocGFyYW1EYXRlLCB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5hcGlfZGF0ZV9mb3JtYXQpO1xuXG5cdFx0XHR2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwudGFyZ2V0SWQpO1xuXHRcdFx0dGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZWZyZXNoJywgeyBkZXRhaWw6IHsgY2FsbGJhY2s6IHRoaXMucmVmcmVzaC5iaW5kKHRoaXMpIH19ICkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIGFuZCByZWZyZXNoIHBsYW5uaW5nXG5cdFx0Ki9cblx0XHRpbml0aWFsaXplRGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkLmRhdGVwaWNrZXIuc2V0RGVmYXVsdHMoICQuZGF0ZXBpY2tlci5yZWdpb25hbFtjb21tb25TZXR0aW5ncy5sYW5ndWFnZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZykgfHzCoCdlcyddICk7XG5cdFx0XHRcblx0XHRcdHZhciBpbnB1dERhdGUgPSB0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJyk7XG5cdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5kYXRlLmFjdHVhbCk7XG5cdFx0XHRcblx0XHRcdGlucHV0RGF0ZS5kYXRlcGlja2VyKHtcblx0XHRcdFx0bWluRGF0ZTogZGF0ZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRpbnB1dERhdGUuZGF0ZXBpY2tlcignc2V0RGF0ZScsIGRhdGUpO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdpbnB1dFtuYW1lPWRhdGVdJykub2ZmKCdjaGFuZ2UnKTtcblx0XHRcdHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB2YWx1ZSA9ICQodGhpcykuZGF0ZXBpY2tlcignZ2V0RGF0ZScpO1xuXG5cdFx0XHRcdHRoYXQuc2V0RGF0ZSh2YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0cmVmcmVzaDogZnVuY3Rpb24oeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0aWYgKHRvdGFsID4gMCkge1xuXHRcdFx0XHR0aGlzLnNldENvbHVtbnModG90YWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwucmVhbENhbGVuZGFyLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5zZXRTY3JvbGxDYWxlbmRhckJ1dHRvbnNTdGF0ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFNjcm9sbEJ1dHRvbnNTdGF0ZSgpO1xuXG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC5maW5kKCdzZWxlY3RbbmFtZT1jYXRlZ29yeV0nKS52YWwoY2F0ZWdvcnkpO1xuXHRcdH0sXG5cdH07XG5cblx0dmFyIHZpZXcgPSB7XG5cdFx0LyoqXG5cdFx0ICogU2V0IGNvbHVtbnMgd2lkdGggYW5kIGZpeCBjb250YWluZXIgdG8gc2hvdyBjb21wbGV0ZSBjb2x1bW5zXG5cdFx0Ki9cblx0XHRzZXRDb2x1bW5zOiBmdW5jdGlvbih0b3RhbCkge1xuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsID0gdG90YWw7XG5cblx0XHRcdHZhciB0YXJnZXQgPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXQ7XG5cdFx0XHR2YXIgY29udGFpbmVyID0gJCh0YXJnZXQpLmZpbmQoJy5teWJvb2tpbmctcGxhbm5pbmctc2Nyb2xsYWJsZScpO1xuXHRcdFx0dmFyIHRocyA9ICQodGFyZ2V0KS5maW5kKCd0aGVhZCB0aDpub3QoLm15Ym9va2luZy1wbGFubmluZy10ZC1maXgpJyk7XG5cdFx0XHR2YXIgdGRzID0gJCh0YXJnZXQpLmZpbmQoJ3Rib2R5IHRkJyk7XG5cdFx0XHR2YXIgY29udGFpbmVyV2lkdGggPSB0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC50YXJnZXQuY2xvc2VzdCgnLm15Ym9va2luZy1wbGFubmluZy1jb250ZW50Jykud2lkdGgoKSAtIHdpbmRvdy5wYXJzZUludChjb250YWluZXIuY3NzKCdtYXJnaW4tbGVmdCcpKTtcblxuXHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzID0gTWF0aC5mbG9vcihjb250YWluZXJXaWR0aCAvIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLmNvbHVtbnMudmlzaWJsZXMgPiB0aGlzLm1vZGVsLmNvbHVtbnMudG90YWwpIHtcblx0XHRcdFx0dGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzID0gdGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsO1xuXHRcdFx0fVxuXG5cdFx0XHR0aHMuY3NzKCd3aWR0aCcsIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCArICdweCcgKTtcblx0XHRcdHRkcy5jc3MoJ3dpZHRoJywgdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoICsgJ3B4JyApO1xuXHRcdFx0Y29udGFpbmVyLmNzcygnd2lkdGgnLCAodGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzICogdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoKSArICdweCcpO1xuXHRcdFx0XG5cdFx0XHRpZiAodGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsICogdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoID4gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiAqIC0xKXtcblx0XHRcdFx0Y29udGFpbmVyLmZpbmQoJ3RhYmxlJykuY3NzKCdtYXJnaW4tbGVmdCcsIHRoaXMubW9kZWwuY29sdW1ucy5hY3R1YWxNYXJnaW4pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTY3JvbGwgY2FsZW5kYXJcblx0XHQqL1xuXHRcdHNldFNjcm9sbENhbGVuZGFyQnV0dG9uc1N0YXRlOiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGRhdGVCdXR0b25zID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnYnV0dG9uW2RhdGEtYWN0aW9uPWRhdGVdJyk7XG5cdFx0XHR2YXIgZmlyc3REYXRlID0gbW9tZW50KG5ldyBEYXRlKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmNvbmZpZ3VyYXRpb24uc2VydmVyRGF0ZSkpO1xuXG5cdFx0XHRpZihtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpLmlzU2FtZShmaXJzdERhdGUpIHx8wqBtb21lbnQodGhpcy5tb2RlbC5wYXJlbnQubW9kZWwuZGF0ZS5hY3R1YWwpLmlzQmVmb3JlKGZpcnN0RGF0ZSkpIHtcblx0XHRcdFx0JChkYXRlQnV0dG9uc1swXSkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoZGF0ZUJ1dHRvbnNbMF0pLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNjcm9sbENhbGVuZGFyOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gdGFyZ2V0LmF0dHIoJ2RhdGEtZGlyZWN0aW9uJyk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5yZWFsQ2FsZW5kYXIubGVuZ3RoID4gMCl7XG5cdFx0XHRcdHZhciBkYXRlID0gbmV3IERhdGUgKHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmRhdGUuYWN0dWFsKTtcblxuXHRcdFx0XHR2YXIgbmV3RGF0ZSA9IGRpcmVjdGlvbiA9PT0gJ25leHQnID8gbW9tZW50KGRhdGUpLmFkZCgxLCAnZCcpIDogbW9tZW50KGRhdGUpLnN1YnRyYWN0KDEsICdkJyk7XG5cdFx0XHRcdHZhciBmb3JtYXRlRGF0ZSA9IFlTREZvcm1hdHRlci5mb3JtYXREYXRlKG5ld0RhdGUsIHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLmFwaV9kYXRlX2Zvcm1hdCk7XG5cdFx0XHRcdHZhciBuZXdJbnN0YW5jZURhdGUgPSBuZXcgRGF0ZShmb3JtYXRlRGF0ZSk7XG5cblx0XHRcdFx0dmFyIGlucHV0RGF0ZSA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2lucHV0W25hbWU9ZGF0ZV0nKTtcblx0XHRcdFx0aW5wdXREYXRlLmRhdGVwaWNrZXIoJ3NldERhdGUnLCBuZXdJbnN0YW5jZURhdGUpO1xuXHRcdFx0XHR0aGlzLnNldERhdGUobmV3SW5zdGFuY2VEYXRlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSG9yaXpvbnRhbCBzY3JvbGxcblx0XHQqL1xuXHRcdHNldFNjcm9sbEJ1dHRvbnNTdGF0ZTogZnVuY3Rpb24oKXtcblx0XHRcdHZhciBhY3R1YWxNYXJnaW4gPSB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luO1xuXG5cdFx0XHR2YXIgc2Nyb2xsQnV0dG9ucyA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ2J1dHRvbltkYXRhLWFjdGlvbj1zY3JvbGxdJyk7XG5cblx0XHRcdGlmIChhY3R1YWxNYXJnaW4gPj0gMCkge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKHNjcm9sbEJ1dHRvbnNbMF0pLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgoYWN0dWFsTWFyZ2luICogLTEpID49ICgodGhpcy5tb2RlbC5jb2x1bW5zLnRvdGFsIC0gdGhpcy5tb2RlbC5jb2x1bW5zLnZpc2libGVzKSAqIHRoaXMubW9kZWwuY29sdW1ucy53aWR0aCkpIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChzY3JvbGxCdXR0b25zWzFdKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzY3JvbGw6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcblx0XHRcdHZhciBkaXJlY3Rpb24gPSB0YXJnZXQuYXR0cignZGF0YS1kaXJlY3Rpb24nKTtcblxuXHRcdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMubW9kZWwucGFyZW50Lm1vZGVsLnRhcmdldC5maW5kKCcubXlib29raW5nLXBsYW5uaW5nLXNjcm9sbGFibGUgdGFibGUnKTtcblxuXHRcdFx0dmFyIGFjdHVhbE1hcmdpbiA9IDA7XG5cdFx0XHRpZiAoZGlyZWN0aW9uID09PSAnbmV4dCcpIHtcblx0XHRcdFx0YWN0dWFsTWFyZ2luID0gdGhpcy5tb2RlbC5jb2x1bW5zLmFjdHVhbE1hcmdpbiArICAodGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoICogLTEpO1xuXHRcdFx0fSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdiYWNrJykge1xuXHRcdFx0XHRhY3R1YWxNYXJnaW4gPSB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luICsgdGhpcy5tb2RlbC5jb2x1bW5zLndpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luID0gYWN0dWFsTWFyZ2luO1xuXHRcdFx0dGhpcy5zZXRTY3JvbGxCdXR0b25zU3RhdGUoKTtcblxuXHRcdFx0Y29udGFpbmVyLmFuaW1hdGUoe1xuXHRcdFx0XHRtYXJnaW5MZWZ0OiB0aGlzLm1vZGVsLmNvbHVtbnMuYWN0dWFsTWFyZ2luLFxuXHRcdFx0fSwge1xuXHRcdFx0XHRkdXJhdGlvbjogMTAwMFxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEV2ZW50c1xuXHRcdCovXG5cdFx0c2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8qXG5cdFx0XHQqIEJ1dHRvbiBuZXh0IGV2ZW50c1xuXHRcdFx0Ki9cblx0XHRcdHZhciBzY3JvbGxCdXR0b25zID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnYnV0dG9uW2RhdGEtYWN0aW9uPXNjcm9sbF0nKTtcblxuXHRcdFx0dGhpcy5zZXRTY3JvbGxCdXR0b25zU3RhdGUoKTtcblx0XHRcdHNjcm9sbEJ1dHRvbnMub2ZmKCdjbGljaycpO1xuXHRcdFx0c2Nyb2xsQnV0dG9ucy5vbignY2xpY2snLCB0aGlzLnNjcm9sbC5iaW5kKHRoaXMpKTtcblxuXHRcdFx0Lypcblx0XHRcdCogQ2F0ZWdvcnkgc2VsZWN0b3Jcblx0XHRcdCovXG5cdFx0XHR2YXIgY2F0ZWdvcnlTZWxlY3RvciA9IHRoaXMubW9kZWwudGFyZ2V0LmZpbmQoJ3NlbGVjdFtuYW1lPWNhdGVnb3J5XScpO1xuXHRcdFx0Y2F0ZWdvcnlTZWxlY3Rvci5vZmYoJ2NoYW5nZScpO1xuXHRcdFx0Y2F0ZWdvcnlTZWxlY3Rvci5vbignY2hhbmdlJywgdGhpcy5zZXRDYXRlZ29yeS5iaW5kKHRoaXMpKTtcblxuXHRcdFx0Lypcblx0XHRcdCogQ2FsZW5kYXIgc2Nyb2xsXG5cdFx0XHQqL1xuXHRcdFx0dmFyIGRhdGVCdXR0b25zID0gdGhpcy5tb2RlbC50YXJnZXQuZmluZCgnYnV0dG9uW2RhdGEtYWN0aW9uPWRhdGVdJyk7XG5cblx0XHRcdGlmICh0aGlzLm1vZGVsLnBhcmVudC5tb2RlbC5yZWFsQ2FsZW5kYXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5vZmYoJ2NsaWNrJyk7XG5cdFx0XHRcdGRhdGVCdXR0b25zLm9uKCdjbGljaycsIHRoaXMuc2Nyb2xsQ2FsZW5kYXIuYmluZCh0aGlzKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkYXRlQnV0dG9ucy5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzZXRWYWxpZGF0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnRhcmdldC52YWxpZGF0ZSh7XG5cdFx0XHRcdHN1Ym1pdEhhbmRsZXI6IGZ1bmN0aW9uKGZvcm0sIGV2ZW50KSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cnVsZXM6IHsgICAgICAgICBcblx0XHRcdFx0fSxcblx0XHRcdFx0bWVzc2FnZXM6IHtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZXJyb3JQbGFjZW1lbnQ6IGZ1bmN0aW9uIChlcnJvciwgZWxlbWVudCkge1xuXHRcdFx0XHRcdGVycm9yLmluc2VydEFmdGVyKGVsZW1lbnQucGFyZW50KCkpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRlcnJvckNsYXNzIDogJ2Zvcm0tcmVzZXJ2YXRpb24tZXJyb3InXG5cdFx0IH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aXppYWxpemVcblx0XHQqL1xuXHRcdGluaXQ6ICBmdW5jdGlvbiAoeyB0b3RhbCwgY2F0ZWdvcnkgfSkge1xuXHRcdFx0dGhpcy5yZWZyZXNoKHsgdG90YWwsIGNhdGVnb3J5IH0pO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplRGF0ZSgpO1xuXHRcdFx0dGhpcy5pbml0aWFsaXplQ2F0ZWdvcnkoKTtcblx0XHRcdHRoaXMuc2V0RXZlbnRzKCk7XG5cdFx0XHR0aGlzLnNldFZhbGlkYXRpb25zKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBwbGFubmluZ0FjdGlvbkJhciA9IHtcblx0XHQvKipcblx0XHQgKiBGYWN0b3J5XG5cdFx0Ki9cblx0XHRmYWN0b3J5OiBmdW5jdGlvbihvYmopIHtcblx0XHRcdEFjdGlvbkJhci5wcm90b3R5cGUgPSB7XG5cdFx0XHRcdC4uLm1vZGVsLFxuXHRcdFx0XHQuLi5jb250cm9sbGVyLFxuXHRcdFx0XHQuLi52aWV3LFxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIG5ldyBBY3Rpb25CYXIob2JqKTsgXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpemlhbGl6ZVxuXHRcdCovXG5cdFx0aW5pdDogZnVuY3Rpb24oeyBwYXJlbnQsIHNldHRpbmdzICwgdG90YWwsIGNhdGVnb3J5fSkge1xuXHRcdFx0dmFyIGluaXRTZXR0aW5ncyA9IHtcblx0XHRcdFx0cGFyZW50LFxuXHRcdFx0XHQuLi5zZXR0aW5ncyxcblx0XHRcdH07XG5cblx0XHRcdHZhciAgYWN0aW9uQmFyID0gdGhpcy5mYWN0b3J5KGluaXRTZXR0aW5ncyk7XG5cdFx0XHRhY3Rpb25CYXIuaW5pdCh7IHRvdGFsLCBjYXRlZ29yeSB9KTtcblx0XHR9LFxuXHR9O1xuXG5cdHJldHVybiBwbGFubmluZ0FjdGlvbkJhcjtcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=