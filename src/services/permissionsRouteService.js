(function (angular, module, undefined) {
    "use strict";
    module.service("baasicPermissionsRouteService", ["baasicUriTemplateService",
        function (uriTemplateService) {
            return {
                find: function (section) {
                    return uriTemplateService.parse("permissions/sections/{section}/{?searchQuery,sort}");
                },
                getActions: uriTemplateService.parse("permissions/actions/{?searchQuery,sort}"),
                getRoles: uriTemplateService.parse("roles/{?searchQuery,page,rpp,sort}"),
                getUsers: uriTemplateService.parse("users/{?searchQuery,page,rpp,sort}"),
                create: uriTemplateService.parse("permissions/"),
                parse: uriTemplateService.parse
            };
        }]);
}(angular, module));