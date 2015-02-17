﻿/* globals module */
/**
 * @module baasicPermissionsService
**/

/** 
 * @overview Permissions service.
 * @copyright (c) 2015 Mono-Software
 * @license MIT
 * @author Mono-Software
*/
(function (angular, module, undefined) {
    'use strict';
    module.service('baasicPermissionsService', ['$q', '$filter', 'baasicApiHttp', 'baasicApiService', 'baasicConstants', 'baasicPermissionsRouteService', 'baasicAuthorizationService',
        function ($q, $filter, baasicApiHttp, baasicApiService, baasicConstants, permissionsRouteService, authService) {
            var _orderBy = $filter('orderBy');            

            function isEmpty(data) {
                return data === undefined || data === null || data === '';
            }

            function getRoles(options) {
                return baasicApiHttp.get(permissionsRouteService.getRoles.expand(baasicApiService.findParams(options)));
            }

            function getUsers(options) {
                return baasicApiHttp.get(permissionsRouteService.getUsers.expand(baasicApiService.findParams(options)));
            }

            function firstCharToLowerCase(text) {
                return text.replace(/^./, function (char) {
                    return char.toLowerCase();
                });
            }

            return {
                routeService: permissionsRouteService,
                /**
                * Returns a promise that is resolved once the find action has been performed. Success response returns a list of permission resources.
                * @method        
                * @example 
baasicPermissionsService.find("sectionName", {
  search : "searchTerm"
})
.success(function (collection) {
  // perform success action here
})
.error(function (response, status, headers, config) {
  // perform error handling here
});    
                **/ 				
                find: function (section, options) {
                    var params = angular.extend({}, options);
                    params.section = section;
                    return baasicApiHttp.get(permissionsRouteService.find().expand(baasicApiService.findParams(params)));
                },
                /**
                * Returns a promise that is resolved once the getActions action has been performed. Success response returns a list of permission action resources.
                * @method        
                * @example 
baasicPermissionsService.find({
  pageNumber : 1,
  pageSize : 10,
  orderBy : "publishDate",
  orderDirection : "desc",
  search : "searchTerm"
})
.success(function (collection) {
  // perform success action here
})
.error(function (response, status, headers, config) {
  // perform error handling here
});    
                **/ 				
                getActions: function (options) {
                    return baasicApiHttp.get(permissionsRouteService.getActions.expand(baasicApiService.findParams(options)));
                },
                /**
                * Returns a promise that is resolved once the getPermissionSubjects action has been performed. Success response returns a list of matching user and role resources resources.
                * @method        
                * @example 
baasicPermissionsService.getPermissionSubjects({
  orderBy : 'name',
  orderDirection : 'asc',
  search : 'searchTerm'
})
.success(function (collection) {
  // perform success action here
})
.error(function (response, status, headers, config) {
  // perform error handling here
}); 
                **/ 				
                getPermissionSubjects: function (options) {
                    var membershipCollection = [];
                    var resolvedTasks = 0;
                    var deferred = $q.defer();

                    function ensureTaskCount() {
                        resolvedTasks++;
                        if (resolvedTasks === 2) {
                            deferred.resolve(membershipCollection);
                            resolvedTasks = 0;
                        }
                    }

                    getUsers(options)
                        .success(function (collection) {
                            angular.forEach(collection.item, function (item) {
                                var membershipItem = {
                                    name: item.userName,
                                    role: ''
                                };
                                angular.extend(membershipItem, item);
                                membershipCollection.push(membershipItem);
                            });
                            ensureTaskCount();
                        })
                        .error(function (data, status, headers, config) {
                            if (status !== undefined && status !== 403) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            }
                            ensureTaskCount();
                        });

                    getRoles(options)
                        .success(function (collection) {
                            angular.forEach(collection.item, function (item) {
                                var membershipItem = {
                                    name: item.name,
                                    roleName: item.name,
                                    userName: ''
                                };
                                angular.extend(membershipItem, item);
                                membershipCollection.push(membershipItem);
                            });
                            ensureTaskCount();
                        })
                        .error(function (data, status, headers, config) {
                            if (status !== undefined && status !== 403) {
                                deferred.reject({
                                    data: data,
                                    status: status,
                                    headers: headers,
                                    config: config
                                });
                            }
                            ensureTaskCount();
                        });

                    return deferred.promise.then(function () {
                        return _orderBy(membershipCollection, 'name');
                    });
                },
                 /**
                 * Returns a promise that is resolved once the create action has been performed.
                 * @method        
                 * @example 
// readAction and updateActions are resources previously fetched using getActions.
baasicPermissionsService.create({
  actions : [readAction, updateAction],
  section : "Users",
  userName : "userName"
})
.success(function (data) {
  // perform success action here
})
.error(function (response, status, headers, config) {
  // perform error handling here
});
                **/ 				
                create: function (data) {
                    return baasicApiHttp.post(permissionsRouteService.create.expand(), baasicApiService.createParams(data)[baasicConstants.modelPropertyName]);
                },
                 /**
                 * Returns a promise that is resolved once the remove action has been performed. If the action is successfully completed the resource is permanently removed from the system.
                 * @method        
                 * @example 
// Existing resource is a resource previously fetched using get action.				 
baasicPermissionsService.remove(existingResource)
.success(function (data) {
  // perform success action here
})
.error(function (response, status, headers, config) {
  // perform error handling here
});		
				**/					
                remove: function (data) {
                    var params = baasicApiService.removeParams(data);
                    var action = data.actions[0];
                    var operation = !isEmpty(data.role) ? 'Role' : 'User';
                    return baasicApiHttp.delete(params[baasicConstants.modelPropertyName].links('delete' + action.abrv + operation).href);
                },                
                 /**
                 * Creates a new in-memory permission object.
                 * @method        
                 * @example 
// action collection are lookup items fetched using baasicLookupService.get action.
var actionCollection;
return baasicLookupService.get()
.success(function (data) {
  actionCollection = data;
})
.error(function (data, status, headers, config) {});
// subjectItem is an item fetched using baasicPermissionsService.getPermissionSubjects action.
baasicPermissionsService.createPermission("sectionName", actionCollection, subjectItem);
				**/					
                createPermission: function (section, actionCollection, membershipItem) {
                    var permission = {
                        dirty: true,
                        role: membershipItem.roleName,
                        userName: membershipItem.userName,
                        section: section,
                        actions: []
                    };
                    angular.forEach(actionCollection, function (lookupAction) {
                        var newAction = {
                            checked: false
                        };
                        angular.extend(newAction, lookupAction);
                        permission.actions.push(newAction);
                    });
                    return permission;
                },
                 /**
                 * Finds a permission in a given permission collection.
                 * @method        
                 * @example baasicPermissionsService.findPermission(permissionObj, permissionCollection);
				**/						
                findPermission: function (permission, permissionCollection) {
                    for (var i = 0; i < permissionCollection.length; i++) {
                        var item = permissionCollection[i];

                        if (item.section === permission.section &&
                               ((!isEmpty(item.role) && !isEmpty(permission.role) && item.role === permission.role) ||
                               (!isEmpty(item.userName) && !isEmpty(permission.userName) && item.userName === permission.userName))) {
                            return item;
                        }
                    }
                    return undefined;
                },
                 /**
                 * Checks if a permission object exists in a given permission collection.
                 * @method        
                 * @example baasicPermissionsService.exists(permissionObj, permissionCollection);
				**/					
                exists: function (permission, permissionCollection) {
                    return this.findPermission(permission, permissionCollection) !== undefined;
                },
                /**
                * Returns a promise that is resolved once the togglePermission action has been completed. The action will internally either call a remove or create action based on given criteria.
                * @method        
                * @example baasicPermissionsService.togglePermission(permissionObj, action);
				**/					
                togglePermission: function (permission, action) {
                    var requestPermission = {};
                    angular.extend(requestPermission, permission);
                    requestPermission.actions = [action];

                    var operation;
                    if (!action.checked) {
                        operation = this.remove;
                    } else {
                        operation = this.create;
                    }
                    return operation(requestPermission);
                },
                /**
                * Fetches and returns and object containing all existing module permissions.
                * @method        
                * @example baasicPermissionsService.getModulePermissions("sectionName");
				**/					
                getModulePermissions: function (section) {
                    var permission = {
                        update: authService.hasPermission(firstCharToLowerCase(section) + '.update'),
                        create: authService.hasPermission(firstCharToLowerCase(section) + '.create'),
                        remove: authService.hasPermission(firstCharToLowerCase(section) + '.delete'),
                        read: authService.hasPermission(firstCharToLowerCase(section) + '.read'),
                        full: authService.hasPermission(firstCharToLowerCase(section) + '.full')
                    };
                    return permission;
                }
            };
        }]);
}(angular, module));