define('ChangePassword',['jquery', 
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
  var ChangePasswordModel = function() {

    this.requestLanguage = null;
    this.passwordForgottenHash = null;

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
    this.ChangePassword = function(password) {

      console.log('Change password');
      var self = this;
      var url = commonServices.URL_PREFIX + '/api/v1/web-customer/change-password';

      var data = {password: password,
                  password_forgotten_hash: this.passwordForgottenHash};
      var jsonData = JSON.stringify(data);
  
      // Request
      $.ajax({
        type: 'POST',
        url: url,
        data: jsonData,
        dataType : 'json',
        contentType : 'application/json; charset=utf-8',
        success: function(data, textStatus, jqXHR) {
          self.events.fireEvent( {type:'ChangePassword', data: {success: true}} );
          alert(i18next.t('change_password.message'));
          document.forms['mybooking_change_password_form'].reset();
        },
        error: function(data, textStatus, jqXHR) {
          alert(i18next.t('common.error'));
        }
      });  

    }

  }

  /**
   * The controller
   */
  var ChangePasswordController = function() {

    this.model = null;
    this.view = null;

    this.setView = function(_view) {
      this.view = _view;
    }

    this.setModel = function(_model) {
      this.model = _model;
    }

    /**
     * ChangePassword Submit Form
     */
    this.ChangePasswordFormSubmit = function() {
      if ( $('form[name=mybooking_change_password_form]').valid() ) {
        this.model.ChangePassword($('form[name=mybooking_change_password_form] input[name=password]').val());
      }
    }

  }

  /**
   * The view
   */
  var ChangePasswordView = function(_model, _controller) {
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

      this.extractUrlVariables();
      this.setupValidation();
    }

    this.extractUrlVariables = function() {

      var urlVars = commonSettings.getUrlVars();

      if (typeof urlVars['id'] != 'undefined') {
         this.model.passwordForgottenHash = urlVars['id'];
      }
      else {
         alert(i18next.t('common.no_necessary_url_params'));
         throw new Error('passwordForgottenHash not supplied in URL');
      }

    }

    this.setupValidation = function() {
      commonSettings.appendValidators();
      var self = this;
      $('form[name=mybooking_change_password_form]').validate({
        errorClass: 'text-danger',
        submitHandler: function(form) {
            $('#mybooking_change_password_form_error').hide();
            $('#mybooking_change_password_form_error').html('');
            self.controller.ChangePasswordFormSubmit();
            return false;
        },

        invalidHandler : function (form, validator) {
          $('#mybooking_change_password_form_error').html(i18next.t('complete.reservationForm.errors'));
          $('#mybooking_change_password_form_error').show();
        },

        rules: {
          'password' : {
            required: true,
            pwcheck: true,
            minlength: 8
          }
        },
        messages: {
          'password': {
            required: i18next.t('complete.reservationForm.validations.fieldRequired'),
            pwcheck: i18next.t('complete.reservationForm.validations.passwordCheck'),
            minlength: i18next.t('complete.reservationForm.validations.minLength', {minlength: 8})            
          }
        }

      });

    }

  }

  /**
   * ChangePassword component
   */
  var ChangePasswordComponent = function() {
    this.model = new ChangePasswordModel();
    this.controller = new ChangePasswordController();
    this.view = new ChangePasswordView(this.model, this.controller);

    this.controller.setView(this.view);
    this.controller.setModel(this.model);
    this.model.setView(this.view);

  }

  return ChangePasswordComponent;

  

});