/******
 *
 * Password forgotten
 *
 */
require(['jquery', './PasswordForgottenComponent'],
         function($, PasswordForgottenComponent) {

  console.log('password_forgotten');
  var passwordForgottenComponent = new PasswordForgottenComponent();
  passwordForgottenComponent.view.init();

});