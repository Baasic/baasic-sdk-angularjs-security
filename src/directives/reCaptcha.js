/* globals module */

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