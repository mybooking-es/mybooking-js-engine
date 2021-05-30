define('PasswordForgotten',['jquery', 
         'commonServices', 'commonSettings', 'commonTranslations', 'commonLoader',
         'i18next','ysdtemplate', 'YSDEventTarget',
         'jquery.i18next', 'jquery.formparams',
	       'jquery.validate'],
	     function($, 
                commonServices, commonSettings, commonTranslations, commonLoader, 
                i18next, tmpl, YSDEventTarget) {

  /**
   * The model
   */      
  var PasswordForgottenModel = function() {

    this.requestLanguage = null;
    this.events = new YSDEventTarget();
    this.view = null;

    this.setView = function(_view) {
      this.view = _view;
    }
    
    /**
     * Add listener
     */
    this.addListener = function(type, listener) { /* addListener */
       this.events.addEventListener(type, listener);  
    }
      
    /**
     * Remove listener
     */   
    this.removeListener = function(type, listener) { /* removeListener */
       this.events.removeEventListener(type, listener);     
    }

    /**
     * Remove listener
     */
    this.removeListeners = function(type) { /* remove listeners*/
       this.events.removeEventListeners(type);
    }
    
    /**
     * Request password forgotten
     */
    this.requestPasswordForgotten = function(username) {

      console.log('Request password forgotten');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/v1/web-customer/password-forgotten';

      var data = {username: username};
      var jsonData = JSON.stringify(data);
  
      // Request
      $.ajax({
        type: 'POST',
        url: url,
        data: jsonData,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        success: function(data, textStatus, jqXHR) {
          if (data == false) {
            self.events.fireEvent( {type:'PasswordForgotten', data: {success: data}} );
            alert(i18next.t('password_forgotten.invalid_username_email'));
          }
          else {
            self.events.fireEvent( {type:'PasswordForgotten', data: {success: data}} );
            alert(i18next.t('password_forgotten.message'));
            document.forms['mybooking_password_forgotten_form'].reset();
          }
        },
        error: function(data, textStatus, jqXHR) {
          if (jqXHR)
          alert(i18next.t('common.error'));
        }
      });  

    }

  }

  /**
   * The controller
   */
  var PasswordForgottenController = function() {

    this.model = null;
    this.view = null;

    this.setView = function(_view) {
      this.view = _view;
    }

    this.setModel = function(_model) {
      this.model = _model;
    }

    /**
     * PasswordForgotten Submit Form
     */
    this.passwordForgottenFormSubmit = function() {
      if ( $('form[name=mybooking_password_forgotten_form]').valid() ) {
        this.model.requestPasswordForgotten($('form[name=mybooking_password_forgotten_form] input[name=username]').val());
      }
    }

  }

  /**
   * The view
   */
  var PasswordForgottenView = function(_model, _controller) {
    this.model = _model;
    this.controller = _controller;

    this.init = function() {

      this.model.requestLanguage = commonSettings.language(document.documentElement.lang);
      // Initialize i18next for translations
      i18next.init({  
                      lng: this.model.requestLanguage,
                      resources: commonTranslations
                   }, 
                   function (error, t) {
                      // https://github.com/i18next/jquery-i18next#initialize-the-plugin
                      //jqueryI18next.init(i18next, $);
                      // Localize UI
                      //$('.nav').localize();
                   });

      this.setupValidation();
    }

    this.setupValidation = function() {
      var self = this;

      var validateUrl = commonServices.URL_PREFIX + '/api/v1/web-customer/check-user-email';

      $('form[name=mybooking_password_forgotten_form]').validate({
        errorClass: 'text-danger',
        submitHandler: function(form) {
            $('#mybooking_password_forgotten_form_error').hide();
            $('#mybooking_password_forgotten_form_error').html('');
            self.controller.passwordForgottenFormSubmit();
            return false;
        },

        invalidHandler : function (form, validator) {
          $('#mybooking_password_forgotten_form_error').html(i18next.t('complete.reservationForm.errors'));
          $('#mybooking_password_forgotten_form_error').show();
        },

        rules: {
          'username' : {
            required: true
          }
        },
        messages: {
          'username': {
            required: i18next.t('complete.reservationForm.validations.fieldRequired')
          }
        }

      });

    }

  }

  /**
   * PasswordForgotten component
   */
  var PasswordForgottenComponent = function() {
    this.model = new PasswordForgottenModel();
    this.controller = new PasswordForgottenController();
    this.view = new PasswordForgottenView(this.model, this.controller);

    this.controller.setView(this.view);
    this.controller.setModel(this.model);
    this.model.setView(this.view);

  }

  return PasswordForgottenComponent;

  

});