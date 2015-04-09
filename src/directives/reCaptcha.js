﻿/* globals module */
/** 
 * @description `baasicRecaptcha` directive allows you to use the reCaptcha inside your project.
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
/**
 * @copyright (c) 2015 Mono
 * @license MIT
 * @author Mono
 * @overview 
 ***Notes:**
 - To enable reCaptcha, you need to [register for an API key pair](https://www.google.com/recaptcha/admin#list) and configure your Baasic application with obtained Public and Private Key. Intended module should be assigned to `recaptchaKey` constant which is predefined with Public Key value, while Private Key should be setup through Application Dashboard under the Application Settings section.
*/

