// eslint-disable-next-line no-undef
define('commonDateControls',
  ['jquery', 'YSDDateControl'],
  function($, DateControl) {

    var DATA_KEY = 'mybookingDateControl';
    var datePatternRegistered = false;

    function normalizeRoot(root) {
      if (root && root.jquery) return root;
      return $(root || document);
    }

    function normalizeDirection(direction) {
      return direction === 'future' ? 'future' : 'past';
    }

    function findExactByName($scope, selector, name) {
      return $scope.find(selector).filter(function() {
        return $(this).attr('name') === name;
      }).first();
    }

    function hasRequired($element) {
      return !!($element && $element.length && $element.prop('required'));
    }

    function isCompositeVisible(descriptor) {
      if (descriptor.modern && descriptor.$wrapper && descriptor.$wrapper.length) {
        return descriptor.$wrapper.is(':visible');
      }
      return descriptor.$day.is(':visible') ||
             descriptor.$month.is(':visible') ||
             descriptor.$year.is(':visible');
    }

    function hasEnabledSelect(descriptor) {
      return !descriptor.$day.prop('disabled') ||
             !descriptor.$month.prop('disabled') ||
             !descriptor.$year.prop('disabled');
    }

    function requiredIntent(descriptor) {
      return hasRequired(descriptor.$hidden) ||
             hasRequired(descriptor.$day) ||
             hasRequired(descriptor.$month) ||
             hasRequired(descriptor.$year);
    }

    function initializeDescriptor(descriptor, options) {
      var existing = descriptor.$hidden.data(DATA_KEY);
      if (existing) return existing;

      var control = new DateControl(
        descriptor.$day[0],
        descriptor.$month[0],
        descriptor.$year[0],
        descriptor.$hidden[0],
        options.locale,
        undefined,
        descriptor.direction
      );

      descriptor.control = control;
      descriptor.$hidden.data(DATA_KEY, descriptor);

      var initialValue;
      var callbackProvidedValue = false;
      if (typeof options.getInitialValue === 'function') {
        initialValue = options.getInitialValue(descriptor.name);
        callbackProvidedValue = initialValue !== undefined;
      }

      if (!callbackProvidedValue) {
        initialValue = descriptor.$hidden.val();
      }

      if (callbackProvidedValue && initialValue === '') {
        descriptor.$hidden.val('');
      } else if (initialValue !== undefined && initialValue !== null && initialValue !== '') {
        control.setDate(initialValue);
      }

      return descriptor;
    }

    function modernDescriptor($wrapper) {
      var $hidden = $wrapper.find('input[type="hidden"][name]');
      if ($hidden.length !== 1) return null;

      var name = $hidden.first().attr('name');
      if (!name) return null;

      var $day = findExactByName($wrapper, 'select', name + '_day');
      var $month = findExactByName($wrapper, 'select', name + '_month');
      var $year = findExactByName($wrapper, 'select', name + '_year');
      if ($day.length !== 1 || $month.length !== 1 || $year.length !== 1) return null;

      return {
        name: name,
        modern: true,
        direction: normalizeDirection($wrapper.attr('data-date-select-control-direction')),
        $wrapper: $wrapper,
        $day: $day,
        $month: $month,
        $year: $year,
        $hidden: $hidden.first()
      };
    }

    function legacyDescriptor($root, $day, legacyDirections) {
      if ($day.closest('.js-date-select-control').length) return null;

      var dayName = $day.attr('name');
      if (!dayName || dayName.slice(-4) !== '_day') return null;
      var name = dayName.slice(0, -4);
      if (!name) return null;

      var $month = findExactByName($root, 'select', name + '_month');
      var $year = findExactByName($root, 'select', name + '_year');
      var $hidden = findExactByName($root, 'input[type="hidden"]', name);
      if ($month.length !== 1 || $year.length !== 1 || $hidden.length !== 1) return null;

      var direction = legacyDirections && legacyDirections[name];
      return {
        name: name,
        modern: false,
        direction: normalizeDirection(direction),
        $wrapper: null,
        $day: $day,
        $month: $month,
        $year: $year,
        $hidden: $hidden
      };
    }

    function collectInitialized($root) {
      var result = [];
      $root.find('input[type="hidden"][name]').each(function() {
        var descriptor = $(this).data(DATA_KEY);
        if (descriptor) result.push(descriptor);
      });
      return result;
    }

    function ensureDatePattern(message) {
      if (datePatternRegistered) return;
      if (!$.validator || typeof $.validator.addMethod !== 'function') return;

      $.validator.addMethod('date_pattern', function(value) {
        if (value === '') return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      }, message || 'Date format is YYYY-MM-DD.');
      datePatternRegistered = true;
    }

    function descriptorRequired(descriptor) {
      if (!descriptor) return false;
      if (!requiredIntent(descriptor)) return false;
      if (!isCompositeVisible(descriptor)) return false;
      if (!hasEnabledSelect(descriptor)) return false;
      return true;
    }

    var commonDateControls = {
      dataKey: DATA_KEY,

      setup: function(options) {
        options = options || {};
        var $root = normalizeRoot(options.root);
        var locale = options.locale || 'es';
        var setupOptions = {
          locale: locale,
          getInitialValue: options.getInitialValue
        };
        var descriptors = [];

        $root.find('.js-date-select-control').each(function() {
          var descriptor = modernDescriptor($(this));
          if (!descriptor) return;
          descriptors.push(initializeDescriptor(descriptor, setupOptions));
        });

        $root.find('select[name$="_day"]').each(function() {
          var descriptor = legacyDescriptor($root, $(this), options.legacyDirections || {});
          if (!descriptor) return;
          descriptors.push(initializeDescriptor(descriptor, setupOptions));
        });

        return descriptors;
      },

      isDateRequired: function(element) {
        var descriptor = $(element).data(DATA_KEY);
        return descriptorRequired(descriptor);
      },

      applyValidationRules: function(form, datePatternMessage) {
        var $form = normalizeRoot(form);
        ensureDatePattern(datePatternMessage);
        var descriptors = collectInitialized($form);
        for (var i = 0; i < descriptors.length; i++) {
          (function(descriptor) {
            if (!descriptor.$hidden || typeof descriptor.$hidden.rules !== 'function') return;
            descriptor.$hidden.rules('add', {
              required: function() {
                return descriptorRequired(descriptor);
              },
              date_pattern: true,
              messages: {
                date_pattern: datePatternMessage || 'Date format is YYYY-MM-DD.'
              }
            });
          })(descriptors[i]);
        }
        return descriptors.length;
      },

      placeError: function(error, element) {
        var descriptor = $(element).data(DATA_KEY);
        if (!descriptor) return false;

        var $target = null;
        if (descriptor.modern && descriptor.$wrapper && descriptor.$wrapper.length) {
          var $composite = descriptor.$wrapper.find('.mb-custom-date-form').first();
          $target = $composite.length ? $composite : descriptor.$wrapper;
        } else {
          $target = descriptor.$year;
        }

        if (!$target || !$target.length) return false;
        error.insertAfter($target);
        return true;
      },

      _normalizeDirection: normalizeDirection,
      _descriptorRequired: descriptorRequired,
      _collectInitialized: collectInitialized
    };

    return commonDateControls;
  }
);
