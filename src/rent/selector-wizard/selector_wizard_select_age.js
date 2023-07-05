define("selector_wizard_select_place", [
  "jquery",
  "YSDMemoryDataSource",
  "YSDRemoteDataSource",
  "YSDSelectSelector",
  "commonServices",
  "commonSettings",
  "commonTranslations",
  "YSDEventTarget",
  "i18next",
  "moment",
  "ysdtemplate",
  "jquery.i18next",
  "jquery.validate",
  "jquery.ui",
  "jquery.ui.datepicker-es",
  "jquery.ui.datepicker-en",
  "jquery.ui.datepicker-ca",
  "jquery.ui.datepicker-it",
  "jquery.ui.datepicker.validation",
], function (
  $,
  MemoryDataSource,
  RemoteDataSource,
  SelectSelector,
  commonServices,
  commonSettings,
  commonTranslations,
  YSDEventTarget,
  i18next,
  moment,
  tmpl
) {
  var selectorWizardSelectAge = {
    model: {
      events: new YSDEventTarget(), // Events
      configuration: null, // Engine configuration
      requestLanguage: null, // Request language

      driverAgeRules: [], // Age rules

      addListener: function (type, listener) {
        /* addListener */
        this.events.addEventListener(type, listener);
      },

      removeListener: function (type, listener) {
        /* removeListener */
        this.events.removeEventListener(type, listener);
      },

      removeListeners: function (type) {
        /* remove listeners*/
        this.events.removeEventListeners(type);
      },

      /**
       * Access the API to get the age data
       */
      loadAges: function () {
        var self = this;
        var url =
          commonServices.URL_PREFIX + "/api/booking/frontend/driver-age-rules";
        if (commonServices.apiKey && commonServices.apiKey != "") {
          url += "?api_key=" + commonServices.apiKey;
        }

        // Request
        $.ajax({
          type: "GET",
          url: url,
          dataType: "json",
          success: function (data) {
            self.driverAgeRules = data;

            selectorWizardSelectAge.view.update("loaded_ages");
          },
          error: function () {
            alert(i18next.t("selector.error_loading_data"));
          },
        });
      },
    },

    controller: {
      ageSelected: function (value) {
        var item = selectorWizardSelectAge.model.driverAgeRules.filter((item) => item.id == value)[0];

        if (!item.allowed) {
          alert(item.message_not_allowed);
          return;
        }

        selectorWizardSelectAge.model.age = value;

        selectorWizardSelectAge.model.events.fireEvent({
          type: "age_selected",
          data: value,
        });
      },
    },

    view: {
      init: function () {
        // Setup request language (for API calls)
        selectorWizardSelectAge.model.requestLanguage =
          commonSettings.language(document.documentElement.lang);

        selectorWizardSelectAge.model.loadAges();
      },

      update: function (event) {
        switch (event) {
          case "loaded_ages":
            this.showAgeSelector();
            break;
        }
      },

      showAgeSelector: function () {
        // Load the ages
        var html = tmpl("select_age_tmpl")({
          ages: selectorWizardSelectAge.model.driverAgeRules,
        });
        $("#wizard_container_step_body").html(html);

        $(".age-selector").on("click", function () {
          var value = $(this).attr('data-age-id');

          selectorWizardSelectAge.controller.ageSelected(value);
        });
      },
    },
  };

  return selectorWizardSelectAge;
});
