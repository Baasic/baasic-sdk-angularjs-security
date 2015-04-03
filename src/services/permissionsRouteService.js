/* globals module */
/**
 * @module baasicPermissionsRouteService
 * @description Baasic Permissions Route Service provides Baasic route templates which can be expanded to Baasic REST URI's through the [URI Template](https://github.com/Baasic/uritemplate-js) by providing it with an object that contains URI parameters. `baasicPermissionsService` uses `baasicPermissionsRouteService` to obtain a part of needed routes while the other part is obtained through HAL. Route services by convention use the same function names as their corresponding services.
 * @copyright (c) 2015 Mono
 * @license MIT
 * @author Mono
*/
(function (angular, module, undefined) {
    'use strict';
    module.service('baasicPermissionsRouteService', ['baasicUriTemplateService',
        function (uriTemplateService) {
            return {
                /**
                * Parses find route which can be expanded with additional options. Supported items are: 
                * - `section` - Name of the permission section.
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.				
                * @method        
                * @example baasicPermissionsRouteService.find('sectionName').expand({searchQuery: '<search-phrase>'});               
                **/  			
                find: function (section) {
                    return uriTemplateService.parse('permissions/sections/{section}/{?searchQuery,sort}', section);
                },
                /**
                * Parses getActions route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.				
                * @method        
                * @example baasicPermissionsRouteService.getActions.expand({searchQuery: '<search-phrase>'});               
                **/  				
                getActions: uriTemplateService.parse('permissions/actions/{?searchQuery,sort}'),
                /**
                * Parses getRoles route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.	
                * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                * - `rpp` - A value used to limit the size of result set per page.				
                * @method        
                * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: '<search-phrase>'});               
                **/  				
                getRoles: uriTemplateService.parse('roles/{?searchQuery,page,rpp,sort}'),
                /**
                * Parses getUsers route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.	
                * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                * - `rpp` - A value used to limit the size of result set per page.				
                * @method        
                * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: '<search-phrase>'});               
                **/  				
                getUsers: uriTemplateService.parse('users/{?searchQuery,page,rpp,sort}'),
                /**
                * Parses create permission route; this URI template doesn't expose any additional properties.
                * @method        
                * @example baasicPermissionsRouteService.create.expand({});               
                **/ 				
                create: uriTemplateService.parse('permissions/'),
				/**
				* Parses and expands URI templates based on [RFC6570](http://tools.ietf.org/html/rfc6570) specifications. For more information please visit the project [GitHub](https://github.com/Baasic/uritemplate-js) page.
				* @method tags.parse
				* @example baasicPermissionsRouteService.parse('route/{?embed,fields,options}').expand({embed: '<embedded-resource>'});
				**/					
                parse: uriTemplateService.parse
            };
        }]);
}(angular, module));