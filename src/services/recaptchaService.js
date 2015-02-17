/* globals module, Recaptcha */
/**
 * @module baasicRecaptchaService
**/

/** 
 * @overview Recaptcha service.
 * @copyright (c) 2015 Mono-Software
 * @license MIT
 * @author Mono-Software
*/
(function (angular, module, undefined) {
    'use strict';
    module.service('baasicRecaptchaService', ['recaptchaKey',
        function (recaptchaKey) {
            return {
                /**
                * Creates a new reCaptcha instance.
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
                * Returns a new reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.challenge();
                **/ 				
                challenge: function () {
					/* jshint camelcase: false */
                    return Recaptcha.get_challenge();
                },
                /**
                * Returns a user response.
                * @method        
                * @example baasicRecaptchaService.response();
                **/ 				
                response: function () {
					/* jshint camelcase: false */
                    return Recaptcha.get_response();
                },
                /**
                * Reloads reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.reload();
                **/ 				
                reload: function () {
                    Recaptcha.reload();
                },
                /**
                * Destroys reCaptcha instance.
                * @method        
                * @example baasicRecaptchaService.destroy();
                **/ 				
                destroy: function () {
                    Recaptcha.destroy();
                }
            };
        }]);
}(angular, module));