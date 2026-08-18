// eslint-disable-next-line no-undef
define('commonFormValidation',
  ['jquery'],
  function($) {

    // Exact 11 Builder-authority identity selects — required only when marked + effectively visible.
    var BUILDER_AUTHORITY_FIELDS = [
      'customer_nacionality',
      'driver_nacionality',
      'additional_driver_1_nacionality',
      'additional_driver_2_nacionality',
      'customer_document_id_type_id',
      'driver_document_id_type_id',
      'additional_driver_1_document_id_type_id',
      'additional_driver_2_document_id_type_id',
      'driver_driving_license_type_id',
      'additional_driver_1_driving_license_type_id',
      'additional_driver_2_driving_license_type_id'
    ];

    var commonFormValidation = {

      builderAuthorityFields: BUILDER_AUTHORITY_FIELDS,

      /**
       * Effective visibility for a named control.
       * A Select2-backed <select> is intentionally hidden by Select2; in that case
       * the visible Select2 container determines effective visibility.
       */
      isEffectivelyVisible: function(name) {
        var $el = $('[name="' + name + '"]');
        if (!$el.length) return false;
        if ($el.is(':visible')) return true;
        // Select2 hides the source <select> and inserts a sibling span.select2-container
        var $container = $el.next('span.select2-container');
        if ($container.length && $container.is(':visible')) {
          return true;
        }
        return false;
      },

      /**
       * Builder-authority required: the <select> has the `required` attribute
       * AND its effective UI control is visible.
       */
      isBuilderAuthorityRequired: function(name) {
        var $el = $('[name="' + name + '"]');
        if (!$el.length) return false;
        if (!$el.attr('required')) return false;
        return this.isEffectivelyVisible(name);
      },

      /**
       * Returns a jQuery Validate required-rule function for a single Builder-authority field.
       */
      buildBuilderAuthorityRequiredFn: function(name) {
        var self = this;
        return function() {
          return self.isBuilderAuthorityRequired(name);
        };
      },

      /**
       * Engine-forced required: effective visibility only, no markup required attr.
       * Used for Engine-controlled Select2 fields (customer_type, customer_classifier_id).
       */
      isEngineRequiredIfRendered: function(name) {
        return this.isEffectivelyVisible(name);
      },

      buildEngineRequiredIfRenderedFn: function(name) {
        var self = this;
        return function() {
          return self.isEngineRequiredIfRendered(name);
        };
      },

      /**
       * Build a jQuery Validate rules sub-object for all 11 Builder-authority fields.
       * Each field: { required: fn }
       */
      buildIdentityRequiredRules: function() {
        var self = this;
        var rules = {};
        for (var i = 0; i < BUILDER_AUTHORITY_FIELDS.length; i++) {
          (function(fieldName) {
            rules[fieldName] = {
              required: self.buildBuilderAuthorityRequiredFn(fieldName)
            };
          })(BUILDER_AUTHORITY_FIELDS[i]);
        }
        return rules;
      },

      /**
       * Try to place a validation error after a Select2 container for the element.
       * Returns true if placement was handled; false to fall through to default.
       */
      identityErrorPlacement: function(error, element) {
        var name = element.attr('name');
        if (!name) return false;
        // Check for adjacent Select2 container
        var $container = element.next('span.select2-container');
        if ($container.length) {
          error.insertAfter($container);
          return true;
        }
        return false;
      },

      /**
       * Effective visibility for any CSS/jQuery selector.
       * Handles Select2-backed elements the same way as isEffectivelyVisible.
       */
      isEffectivelyVisibleBySelector: function(sel) {
        var $el = $(sel);
        if (!$el.length) return false;
        if ($el.is(':visible')) return true;
        var $container = $el.next('span.select2-container');
        if ($container.length && $container.is(':visible')) return true;
        return false;
      },

      /**
       * Returns a jQuery Validate required-rule function for any selector.
       * Required when: effectively visible AND has the `required` HTML attribute.
       */
      buildSelectorRequiredFn: function(sel) {
        var self = this;
        return function() {
          return self.isEffectivelyVisibleBySelector(sel) && !!$(sel).attr('required');
        };
      },

      /**
       * Returns a jQuery Validate required-rule function for any selector.
       * Required when: effectively visible (engine-required, no markup attr needed).
       */
      buildSelectorVisibleFn: function(sel) {
        var self = this;
        return function() {
          return self.isEffectivelyVisibleBySelector(sel);
        };
      },

      /**
       * True when the selector's element is visible (including Select2) AND has `required` attr.
       */
      isSelectorMarkupRequiredAndVisible: function(sel) {
        var $el = $(sel);
        if (!$el.length) return false;
        if (!$el.attr('required')) return false;
        return this.isEffectivelyVisibleBySelector(sel);
      },

      /**
       * Paired required for SES address controls: true when the canonical text input
       * is visible+required OR the alternate SES code select is visible+required.
       * Only one of the pair is shown at a time (ES vs non-ES mode).
       */
      buildPairedRequiredFn: function(canonicalSelector, alternateSelector) {
        var self = this;
        return function() {
          return self.isSelectorMarkupRequiredAndVisible(canonicalSelector) ||
                 self.isSelectorMarkupRequiredAndVisible(alternateSelector);
        };
      },

      /**
       * Error placement for paired canonical/SES fields.
       * When the alternate SES code select is effectively visible, inserts after its Select2 container.
       * Otherwise falls through (returns false) for default placement.
       */
      placeErrorAfterActiveAlternate: function(error, canonicalElement, alternateSelector) {
        var $alt = $(alternateSelector);
        if (!$alt.length) return false;
        var $container = $alt.next('span.select2-container');
        if ($container.length && $container.is(':visible')) {
          error.insertAfter($container);
          return true;
        }
        return false;
      }

    };

    return commonFormValidation;
  }
);
