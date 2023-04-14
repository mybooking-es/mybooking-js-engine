// eslint-disable-next-line no-undef
define('planningActionBar', [
  'jquery',
  'YSDEventTarget',
  'commonSettings',
  'moment',
  'YSDFormatter',
  'jquery.validate',
  'jquery.ui',
  'jquery.ui.datepicker-es',
  'jquery.ui.datepicker-en',
  'jquery.ui.datepicker-ca',
  'jquery.ui.datepicker-it',
  'jquery.ui.datepicker.validation',
], function ($, YSDEventTarget, commonSettings, moment, YSDFormatter) {
  /**
   * Contructor
   */
  function ActionBar({ target, parent, columnsWidth }) {
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
      },
    };
  }

  const model = {};

  const controller = {
    /**
     * Set family
     */
    setRentalLocation: function (event) {
      const value = $(event.currentTarget).val();
      this.model.parent.model.rentalLocation = value;
      this.model.parent.model.family = 'all'; // TODO

      const target = document.getElementById(this.model.parent.model.targetId);
      target.dispatchEvent(
        new CustomEvent('refresh', {
          detail: { callback: this.refresh.bind(this) },
        })
      );
    },

    /**
     * Initialize rental location
     */
    initializeRentalLocation: function () {
      const rentalLocationSelector = this.model.target.find(
        'select[name=rentalLocation]'
      );
      rentalLocationSelector.html('');
      rentalLocationSelector.closest('.field').css('display', 'block');

      rentalLocationSelector.append(
        '<option value="all">' +
          rentalLocationSelector.closest('.select').attr('data-default') +
          '</option>'
      );

      if (
        this.model.parent.model.rentalLocations &&
        this.model.parent.model.rentalLocations.length > 0
      ) {
        this.model.parent.model.rentalLocations.forEach(function (item) {
          rentalLocationSelector.append(
            '<option value="' + item.code + '">' + item.name + '</option>'
          );
        });

        /*
         * Set events
         */
        rentalLocationSelector.off('change');
        rentalLocationSelector.on('change', this.setRentalLocation.bind(this));
        rentalLocationSelector.removeAttr('disabled');
      } else {
        rentalLocationSelector.attr('disabled', 'disabled');
      }
    },

    /**
     * Set family
     */
    setFamily: function (event) {
      const value = $(event.currentTarget).val();
      this.model.parent.model.family = value;
      this.model.parent.model.category = 'all';

      const target = document.getElementById(this.model.parent.model.targetId);
      target.dispatchEvent(
        new CustomEvent('refresh', {
          detail: { callback: this.refresh.bind(this) },
        })
      );
    },

    /**
     * Initialize family
     */
    initializeFamily: function () {
      const familySelector = this.model.target.find('select[name=family]');
      familySelector.html('');
      familySelector.closest('.field').css('display', 'block');

      familySelector.append(
        '<option value="all">' +
          familySelector.closest('.select').attr('data-default') +
          '</option>'
      );

      if (
        this.model.parent.model.families &&
        this.model.parent.model.families.length > 0
      ) {
        this.model.parent.model.families.forEach(function (item) {
          familySelector.append(
            '<option value="' + item.id + '">' + item.name + '</option>'
          );
        });
        /*
         * Set events
         */
        familySelector.off('change');
        familySelector.on('change', this.setFamily.bind(this));
        familySelector.removeAttr('disabled');
      } else {
        familySelector.attr('disabled', 'disabled');
      }
    },

    /**
     * Set category
     */
    setCategory: function (event) {
      const value = $(event.currentTarget).val();

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

      categorySelector.append(
        '<option value="all">' +
          categorySelector.closest('.select').attr('data-default') +
          '</option>'
      );

      if (
        this.model.parent.model.categories.length &&
        this.model.parent.model.categories.length > 0
      ) {
        this.model.parent.model.categories.forEach(function (item) {
          categorySelector.append(
            '<option value="' + item.code + '">' + item.name + '</option>'
          );
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
    setDate: function (paramDate) {
      this.model.parent.model.date.actual = YSDFormatter.formatDate(
        paramDate,
        this.model.parent.model.api_date_format
      );

      const target = document.getElementById(this.model.parent.model.targetId);
      target.dispatchEvent(
        new CustomEvent('refresh', {
          detail: { callback: this.refresh.bind(this) },
        })
      );
    },

    /**
     * Initialize and refresh planning
     */
    initializeDate: function () {
      $.datepicker.setDefaults(
        $.datepicker.regional[
          commonSettings.language(document.documentElement.lang) || 'es'
        ]
      );

      const inputDate = this.model.target.find('input[name=date]');
      const date = new Date(this.model.parent.model.date.actual);

      inputDate.datepicker({
        minDate: new Date(this.model.parent.model.configuration.serverDate),
      });

      inputDate.datepicker('setDate', date);

      const that = this;
      this.model.target.find('input[name=date]').off('change');
      this.model.target.find('input[name=date]').on('change', function () {
        const value = $(this).datepicker('getDate');

        that.setDate(value);
      });
    },

    /**
     * Refresh the planning action bar
     */
    refresh: function ({ total, rentalLocation, family, category }) {
      if (total > 0) {
        this.setColumns(total);
      }

      if (this.model.parent.model.realCalendar.length > 0) {
        this.setScrollCalendarButtonsState();
      }

      this.setScrollButtonsState();

      if (rentalLocation) {
        this.model.target
          .find('select[name=rentalLocation]')
          .val(rentalLocation);
      }
      if (family) {
        this.model.target.find('select[name=family]').val(family);
      }
      if (category) {
        this.initializeCategory();
        this.model.target.find('select[name=category]').val(category);
      }
    },
  };

  const view = {
    /**
     * Set columns width and fix container to show complete columns
     */
    setColumns: function (total) {
      this.model.columns.total = total;

      const target = this.model.parent.model.target;
      const container = $(target).find('.mybooking-planning-scrollable');
      const ths = $(target).find('thead th:not(.mybooking-planning-td-fix)');
      const tds = $(target).find('tbody td');
      const containerWidth =
        this.model.parent.model.target
          .closest('.mybooking-planning-content')
          .width() - window.parseInt(container.css('margin-left'));

      this.model.columns.visibles = Math.floor(
        containerWidth / this.model.columns.width
      );

      if (this.model.columns.visibles > this.model.columns.total) {
        this.model.columns.visibles = this.model.columns.total;
      }

      ths.css('width', this.model.columns.width + 'px');
      tds.css('width', this.model.columns.width + 'px');
      container.css(
        'width',
        this.model.columns.visibles * this.model.columns.width + 'px'
      );

      if (
        this.model.columns.total * this.model.columns.width >
        this.model.columns.actualMargin * -1
      ) {
        container
          .find('table')
          .css('margin-left', this.model.columns.actualMargin);
      }
    },

    /**
     * Scroll calendar
     */
    setScrollCalendarButtonsState: function () {
      const dateButtons = this.model.target.find('button[data-action=date]');
      const firstDate = moment(
        this.model.parent.model.configuration.serverDate
      );

      if (
        moment(this.model.parent.model.date.actual).isSame(firstDate) ||
        moment(this.model.parent.model.date.actual).isBefore(firstDate)
      ) {
        $(dateButtons[0]).attr('disabled', 'disabled');
      } else {
        $(dateButtons[0]).removeAttr('disabled');
      }
    },

    scrollCalendar: function (event) {
      const target = $(event.currentTarget);
      const direction = target.attr('data-direction');

      if (this.model.parent.model.realCalendar.length > 0) {
        const date = new Date(this.model.parent.model.date.actual);

        const newDate =
          direction === 'next'
            ? moment(date).add(1, 'd')
            : moment(date).subtract(1, 'd');
        const formateDate = YSDFormatter.formatDate(
          newDate,
          this.model.parent.model.api_date_format
        );
        const newInstanceDate = new Date(formateDate);

        const inputDate = this.model.target.find('input[name=date]');
        inputDate.datepicker('setDate', newInstanceDate);

        this.setDate(newInstanceDate);
      }
    },

    /**
     * Horizontal scroll
     */
    setScrollButtonsState: function () {
      const actualMargin = this.model.columns.actualMargin;

      const scrollButtons = this.model.target.find(
        'button[data-action=scroll]'
      );

      if (actualMargin >= 0) {
        $(scrollButtons[0]).attr('disabled', 'disabled');
      } else {
        $(scrollButtons[0]).removeAttr('disabled');
      }

      if (
        actualMargin * -1 >=
        (this.model.columns.total - this.model.columns.visibles) *
          this.model.columns.width
      ) {
        $(scrollButtons[1]).attr('disabled', 'disabled');
      } else {
        $(scrollButtons[1]).removeAttr('disabled');
      }
    },

    scroll: function (event) {
      const target = $(event.currentTarget);
      const direction = target.attr('data-direction');

      const container = this.model.parent.model.target.find(
        '.mybooking-planning-scrollable table'
      );

      let actualMargin = 0;
      if (direction === 'next') {
        actualMargin =
          this.model.columns.actualMargin + this.model.columns.width * -1;
      } else if (direction === 'back') {
        actualMargin =
          this.model.columns.actualMargin + this.model.columns.width;
      }

      this.model.columns.actualMargin = actualMargin;
      this.setScrollButtonsState();

      container.animate(
        {
          marginLeft: this.model.columns.actualMargin,
        },
        {
          duration: 1000,
        }
      );
    },

    /**
     * Events
     */
    setEvents: function () {
      /*
       * Button next events
       */
      const scrollButtons = this.model.target.find(
        'button[data-action=scroll]'
      );

      this.setScrollButtonsState();
      scrollButtons.off('click');
      scrollButtons.on('click', this.scroll.bind(this));

      /*
       * Calendar scroll
       */
      const dateButtons = this.model.target.find('button[data-action=date]');

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
    init: function (obj) {
      const { total, rentalLocation, family, category } = obj;

      this.refresh({ total, rentalLocation, family, category });
      this.initializeDate();

      if (rentalLocation) {
        this.initializeRentalLocation();
      }
      if (family) {
        this.initializeFamily();
      }
      if (category) {
        this.initializeCategory();
      }

      this.setEvents();
      this.setupValidations();
    },
  };

  const planningActionBar = {
    /**
     * Factory
     */
    factory: function (obj) {
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
    init: function ({ settings, total, rentalLocation, family, category }) {
      const actionBar = this.factory(settings);
      actionBar.init({ total, rentalLocation, family, category });
    },
  };

  return planningActionBar;
});
