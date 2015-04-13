/* globals module, Recaptcha */
/**
 * @module baasicRecaptchaService
 * @description `baasicRecaptchaService` provides an easy way to consume ReCapctcha REST API end-points. For more information please visit [reCaptcha documentation](https://code.google.com/p/recaptcha/wiki/HowToSetUpRecaptcha).
 * @copyright (c) 2015 Mono
 * @license MIT
 * @author Mono
*/
(function (angular, module, undefined) {
    'use strict';
    module.service('baasicRecaptchaService', ['recaptchaKey',
        function (recaptchaKey) {
            return {
                /**
                * Creates a new reCaptcha instance with provided options and injects a reCaptcha DOM onto a given element.
                * @method        
                * @example baasicRecaptchaService.create(element, {theme: 'clean'});
                **/ 			
                create: function (elem, options) {
                    var id = elem.attr('id');
                    if (!id) {
                        id = 'recaptcha-' + Math.random() * 10000;
                        elem.attr('id', id);
                    }
                    Recaptcha.create(recaptchaKey, id, options);
                },
                /**
                * Communicates with reCaptcha service and provides a reCaptcha challenge identifier.
                * @method        
                * @example baasicRecaptchaService.challenge();
                **/ 				
                challenge: function () {
					/* jshint camelcase: false */
                    return Recaptcha.get_challenge();
                },
                /**
                * Communicates with reCaptcha service and returns users response to a reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.response();
                **/ 				
                response: function () {
					/* jshint camelcase: false */
                    return Recaptcha.get_response();
                },
                /**
                * Communicates with reCaptcha service and displays a new reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.reload();
                **/ 				
                reload: function () {
                    Recaptcha.reload();
                },
                /**
                * Communicates with reCaptcha service and unloads a reCaptcha instance.
                * @method        
                * @example baasicRecaptchaService.destroy();
                **/ 				
                destroy: function () {
                    Recaptcha.destroy();
                }
            };
        }]);
}(angular, module));