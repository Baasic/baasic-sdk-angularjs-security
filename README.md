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
