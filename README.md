# NoSmoke

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/nosmoke.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nosmoke
[travis-image]: https://img.shields.io/travis/macacajs/NoSmoke.svg?style=flat-square
[travis-url]: https://travis-ci.org/macacajs/NoSmoke
[coveralls-image]: https://img.shields.io/coveralls/macacajs/NoSmoke.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/macacajs/NoSmoke?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_7-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/nosmoke.svg?style=flat-square
[download-url]: https://npmjs.org/package/nosmoke

---

> A cross platform UI crawler which scans view trees then generate and execute UI test cases. with it you can:

- conduct automated UI test without writing a single UI test scripts!!
- more accurate than mokey test!!
- one tool and configuration, multiple platform!

## How it works?

![image](https://user-images.githubusercontent.com/8198256/31303704-aa26c68a-ab44-11e7-9346-02db403edc48.png)

In order to design a multiplatform UI automation tool, the overall architcture is devided into 3 different layers. 

- The **Proxy** layer, which are tester drivers wrapping local platform testing tool like UIAutomator, XCUITest. They establishes sockets which recieve and executes requests in format of [web driver](https://www.w3.org/TR/webdriver/) protocol. 

- The **Macaca-Server** layer, which are node server created on PC. It provides a set of cli-command based on which users can install the testing app and init the proxy on a specific device. Further it routes http request to proxies in various platforms.

- The **NoSmoke** layer, it contains a node client which posting various crawling and analysis commands to **Macaca-Server** layer. The crawling algorithm in this module utilizes the node client to fetch window sources and convert it to a DFS tree model, then eventually send out a UI action to the target app via **macaca-server** and **proxy**.

## Features

### a. Muliplatform

NoSmoke supports UI crawling and testing for **iOS**, **Android** and **PC Web**, [macaca-reporter](https://github.com/macacajs/macaca-reporter) is used to gather and present the crawling process. During the execution of nosmoke, the current page and relevent action info will be revealed on reporter:

#### Running on android 

![macaca-android](https://user-images.githubusercontent.com/8198256/31303578-988f5db2-ab42-11e7-8b96-52175fe4ba92.gif)

#### Running on iOS

![macaca-ios](https://user-images.githubusercontent.com/8198256/31303576-98897564-ab42-11e7-9a12-36e5aaf5161d.gif)

#### Running on web-pc

![web-pc](https://user-images.githubusercontent.com/8198256/31303577-988df9c2-ab42-11e7-8c60-1bd456cedddd.gif)

### b. Configurable 

Refer to the crawler.config.yml file in the NoSmoke/public folder as a example. You can choose which platform to conduct the crawling task:

```
desiredCapabilities:
	platformName: 'iOS'
  	deviceName: 'iPhone 6 Plus'
 	app: 'https://npmcdn.com/ios-app-bootstrap@latest/build/ios-app-bootstrap.zip'
```

And the corresponding configuration for crawling the app:

```
crawlingConfig:
  platform: 'ios'   // platforms to run: android, ios, pc-web
  testingPeriod:    // maximun testing period for a crawling task, after which the task will terminate
  testingDepth :    // maximum testing depth of the UI window tree, exeeding which 'Back' navigation will be triggered
  newCommandTimeout:// time interval takes to examine current window source after a crawling UI action has been performed
  launchTimeout:    // time interval to wait after app has been launched.
  maxActionPerPage: // max UI actions filtered and performed perpage, this will provide greate memory optimization and prevent an Page for staying too long   
  targetElements:   // array of hight priority UI element to perform
  asserts:          // provide for regex assert test cases for windows
  exclusivePattern: // specify the pattern hence you can let those element which contain the regex pattern be excluded from exection
  clickTypes:       // specify the types of UI element which can handle click events
  editTypes:        // specify the types of UI element which can handle edit events
  horizontalScrollTypes: // specify the types of UI element which can handle horizontal scroll
  tabBarTypes:      // specify the types of UI element may act as a control widget in master-detail pattern
  exclusiveTypes:   // specify the types of UI element in which all the sub-views will be exclueded from scanning and crawl
```

### c. Hookable
There are several hook api provided to provide further space to realize your own customization. 
You can intercept the 'performAction' function which is called everytime a UI action is executing, 
you can return your own promise object to replace the existing default performAction method. 

```
/**
 * Method to perform action for the current platform.
 * @Params: action the action which belongs to current active node, and is going to be performed
 * @Params: crawler the crawler instance which contains the context information as well as crawler config
 * @Returns: your own promise to indicate that the performAction method has been fully customized
 * */
Hooks.prototype.performAction = function(action, crawler) {
  	return new Promise((resolve, reject) => {
  		... execute your async tasks here ... and then call resolve to continue the framework's crawling process
  	});
};

```

After an certain UI action has been performed, you can intercept the crawling task and manually execute any UI operation. After you are done, you can resume the crawling automation process.

```
/**
 * Method to intercept the crawling process after an specific action has been performed
 * @Params: action the action which belongs to current active node, and has just been performed
 * @Params: crawler the crawler instance which contains the context information as well as crawler config
 * @Params: resolve during the calling of this function, the overall crawling process is pending until the resolve is finally called
 * */
Hooks.prototype.afterActionPerformed = function(action, crawler, resolve) {
  // Customize this action to wire through sliding view
  if ("verify whether to intercept the process and conduct manual opperation") {
    ... create a async task execute and call resolve, then the crawling process will continue
  } else {
    resolve();
  }
};
```

## Install & Run

`Platform compatibilty:`

- iOS simulator 11.0 and xcode 9.0 and above.
- Android 6.0 and above.
 
 
Macaca - NoSmoke dependends on the following macaca components:

```
npm i macaca-android -g
npm i macaca-ios -g
npm i macaca-cli -g
npm i macaca-reporter -g
npm i macaca-electron -g
```

a. Open the terminal and initialize macaca server `macaca server --verbose`

b. Execute npm command in the project dir `npm run dev`

When the npm program starts to execute and browser will automatically open the reporter-monitor, it may take several seconds for the program to start simulator. Once the testing target app installed, the crawler program will start execution and reporter's content will be updated.



## License

The MIT License (MIT)
