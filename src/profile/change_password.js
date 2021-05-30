/******
 *
 * Password forgotten
 *
 */
require(['jquery', './ChangePasswordComponent'],
         function($, ChangePasswordComponent) {

  console.log('change_password');
  var changePasswordComponent = new ChangePasswordComponent();
  changePasswordComponent.view.init();

});