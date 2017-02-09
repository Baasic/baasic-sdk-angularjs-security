/* globals module, grecaptcha */
/**
 * @module baasicRecaptchaService
 * @description `baasicRecaptchaService` provides an easy way to consume ReCapctcha REST API end-points. For more information please visit [reCaptcha documentation](https://code.google.com/p/recaptcha/wiki/HowToSetUpRecaptcha).
*/
(function (angular, module, undefined) {
    'use strict';
    module.service('baasicRecaptchaService', ['recaptchaKey',
        function (recaptchaKey) {  
            var wInstances = [];          
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

                    var response = grecaptcha.render(id, angular.extend({
                    'sitekey' : recaptchaKey
                    }, options));

                    wInstances[response] = elem;
                    return response;                    
                },
                /**
                * Communicates with reCaptcha service and provides a reCaptcha challenge identifier.
                * @method        
                * @example baasicRecaptchaService.challenge();
                **/ 				
                challenge: function () {
					/* jshint camelcase: false */                    
                    return {};
                },
                /**
                * Communicates with reCaptcha service and returns users response to a reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.response();
                **/ 				
                response: function (widgetId) {                    
					/* jshint camelcase: false */
                    var result;
                    if (!widgetId) {
                        angular.forEach(wInstances, function(value, key) {
                            if (key !== undefined) {
                                result = grecaptcha.getResponse(key);
                            }
                        });
                    } else {
                        result =  grecaptcha.getResponse(widgetId);
                    }
                    return result;
                },
                /**
                * Communicates with reCaptcha service and displays a new reCaptcha challenge.
                * @method        
                * @example baasicRecaptchaService.reload();
                **/ 				
                reload: function (widgetId) {
                    var result;
                    if (!widgetId) {
                        angular.forEach(wInstances, function(value, key) {
                            if (key !== undefined) {
                                result = grecaptcha.reset(key);
                            }
                        });             
                    } else {       
                        result = grecaptcha.reset(widgetId);
                    }
                    return result;
                },
                /**
                * Communicates with reCaptcha service and unloads a reCaptcha instance.
                * @method        
                * @example baasicRecaptchaService.destroy();
                **/ 				
                destroy: function (widgetId) {
                     if (widgetId) {
                        delete wInstances[widgetId];
                     }                    
                }
            };
        }]);
}(angular, module));
/**
 * @copyright (c) 2017 Mono Ltd
 * @license MIT
 * @author Mono Ltd
*/