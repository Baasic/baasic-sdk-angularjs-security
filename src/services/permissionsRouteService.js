/* globals module */
/**
 * @module baasicPermissionsRouteService
**/

/** 
 * @overview Permissions route service.
 * @copyright (c) 2015 Mono-Software
 * @license MIT
 * @author Mono-Software
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
                * @example baasicPermissionsRouteService.find("sectionName").expand({searchQuery: "searchTerm"});               
                **/  			
                find: function (section) {
                    return uriTemplateService.parse('permissions/sections/{section}/{?searchQuery,sort}', section);
                },
                /**
                * Parses getActions route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.				
                * @method        
                * @example baasicPermissionsRouteService.getActions.expand({searchQuery: "searchTerm"});               
                **/  				
                getActions: uriTemplateService.parse('permissions/actions/{?searchQuery,sort}'),
                /**
                * Parses getRoles route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.	
                * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                * - `rpp` - A value used to limit the size of result set per page.				
                * @method        
                * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: "searchTerm"});               
                **/  				
                getRoles: uriTemplateService.parse('roles/{?searchQuery,page,rpp,sort}'),
                /**
                * Parses getUsers route which can be expanded with additional options. Supported items are: 
                * - `searchQuery` - A string referencing resource properties using the phrase or query search.   
                * - `sort` - A string used to set the role property to sort the result collection by.	
                * - `page` - A value used to set the page size, i.e. to retrieve certain resource subset from the storage.
                * - `rpp` - A value used to limit the size of result set per page.				
                * @method        
                * @example baasicPermissionsRouteService.getRoles.expand({searchQuery: "searchTerm"});               
                **/  				
                getUsers: uriTemplateService.parse('users/{?searchQuery,page,rpp,sort}'),
                /**
                * Parses create permission route; this URI template doesn't expose any additional properties.
                * @method        
                * @example baasicPermissionsRouteService.create.expand({});               
                **/ 				
                create: uriTemplateService.parse('permissions/'),
				/**
				* Parses and expands URI templates based on [RFC6570](http://tools.ietf.org/html/rfc6570) specifications. For more information please visit the project [github](https://github.com/Baasic/uritemplate-js) page.
				* @method tags.parse
				* @example baasicPermissionsRouteService.parse("route/{?embed,fields,options}").expand({embed: "embeddedResource"});
				**/					
                parse: uriTemplateService.parse
            };
        }]);
}(angular, module));