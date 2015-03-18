/* globals module */
/** 
 * @description At a high level, directives are markers on a DOM element (such as an attribute, element name, comment or CSS class) that tell AngularJS's HTML compiler to attach a specified behavior to that DOM element or even transform the DOM element and its children. For more information please visit official AngularJS [documentation](https://docs.angularjs.org/guide/directive). `baasicRecaptcha` directive allows you to use the reCaptcha inside your project.
 * @copyright (c) 2015 Mono-Software
 * @license MIT
 * @author Mono-Software
 * @module baasicRecaptcha
 * @example <div baasic-recaptcha></div> 
*/
(function (angular, module, undefined) {
    'use strict';
    module.directive('baasicRecaptcha', ['baasicRecaptchaService',
        function (recaptchaService) {
            return {
                restrict: 'A',
                link: function (scope, elem) {
                    recaptchaService.create(elem,
                        {
                            theme: 'clean'
                        }
                    );

                    scope.$on('$destroy', function () {
                        if (recaptchaService) {
                            recaptchaService.destroy();
                        }
                    });
                }
            };
        }]);
}(angular, module));