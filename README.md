# Baasic Security AngularJS SDK

Baasic AngularJS Security library provides access to security resource Baasic Service [REST API](https://api.baasic.com).

## Dependencies

Baasic AngularJS Security library has the following dependencies:

* [Baasic Core AngularJS SDK](https://github.com/Baasic/baasic-sdk-sdk-angularjs-core)

## Usage

This section will describe how to add the Baasic AngularJS Security library to your project. If you prefer learning by example please skip to [Demo Section](#demo).

### Adding the Library to your Project

Please add the _Baasic Security_ include after the _Baasic Angular Core_ include:

```html
<script src='//cdn.net/js/baasic-angular-1.0.0.min.js'></script>
<script src='//cdn.net/js/baasic-angular-security-1.0.0.min.js'></script>
```

The recommended way of serving the library is through a [CDN](http://en.wikipedia.org/wiki/Content_delivery_network) but note that this is not a requirement. If you prefer adding library files directly to your project instead, please modify the includes accordingly.


### Initialization

To be able to use the library you will need to add the Baasic (_baasic.security_) dependency to your AngularJS module. This will allow you to use library services described in [Modules Section](#baasic-modules).

```javascript
angular.module('my-module', ["baasic.api", "baasic.security"])
```

## Security Module

Baasic AngularJS Security services and their functions can be found bellow. For further details please check the [API documentation](#tba)

##### authorizationService

Baasic Authorization Service provides an easy way to consume Baasic application authoriation features.

* `getUser` - Gets user ???
* `setUser` - Sets user ???
* `updateUser` - Updates user ???
* `getAccessToken` - Gets access token
* `updateAccessToken` - Updates access token
* `resetPermissions` - Resets all permissions
* `hasPermission` - ???

Here is an example on how to use the `authorizationService`:

```javascript
baasicAuthorizationService.getUser()
    .success(function(data) {
        // data variable contains a current user object
    });
```

##### permissionsService

Baasic Permissions Service provides an easy way to consume Baasic application permissions features.

* `getActions` - Gets actions ???
* `getRoles` - Gets roles ???
* `getUsers` - Gets users ???
* `create` - ???
* `find` - ???

##### recaptchaService

Baasic Recaptcha Service provides an easy way to consume Baasic application recaptcha features.

* `create` - ???
* `challenge` - ???
* `response` - ???
* `reload` - ???
* `destroy` - ???

##### permissionsRouteService

Baasic Permissions Route Service provides Baasic route templates which can then be expanded to Baasic REST URI's through the [URI Template](https://github.com/Baasic/uritemplate-js) by providing it with an object that contains URI parameters. `permissionsService` uses `permissionsRouteService` to obtain a part of needed routes while the other part is obtained through HAL. `permissionsRouteService` by convention uses the same function names as `permissionsService`.

Here is a list of all the `permissionsRouteService` functions:

* `getActions`, `getRoles`, `getUsers`, `create`, `find`
* `parse` - Provides direct access to the `uriTemplateService`

URI templates can be expanded manually like this:

```javascript
var params = { searchQuery: "myQuery", page: 4, rpp: 3 };
var uri = baasicPermissionsRouteService.getRoles.expand(params);
// uri will yield "/roles/?searchQuery=myQuery&page=4&rpp=3"
```

## Build Process

1. Install [NodeJs](http://nodejs.org/download/)
2. Open Shell/Command Prompt in the Baasic AngularJS folder
3. Run `npm install`
4. Install gulp globally: `npm install -g gulp`
5. Run `gulp`

## Contributing

* [Pull requests are always welcome](https://github.com/Baasic/baasic-sdk-sdk-angularjs-core#pull-requests-are-always-welcome)
* Please [report](https://github.com/Baasic/baasic-sdk-sdk-angularjs-core#issue-reporting) any issues you might  have found
* Help us write the documentation
* Create interesting apps using SDK
* Looking for something else to do? Get in touch..
