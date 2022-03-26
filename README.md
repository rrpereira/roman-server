# ROMAN SERVER

This project consists in a simple [Node.js](https://nodejs.org/) (JavaScript) server that converts arabic to [roman numerals](https://en.wikipedia.org/wiki/Roman_numerals). The server is prepared to handle HTTP requests with the following URLs:

```
http://localhost:8080/romannumeral?query={integer}
http://localhost:8080/romannumeral?min={integer}&max={integer}
```

The requirements are the following:

- {integer} must be an integer in the range [1, 3999];
- errors can be returned in plain text format;
- for the first URL, the response to a valid input must be a JSON object with two string values, an 'input' and an 'output'. Output example for route [http://localhost:8080/romannumeral?query=8](http://localhost:8080/romannumeral?query=8):

  ```
  {"input": "8", "output": "VIII"}
  ```

- for the second URL, the response to a valid input must be a JSON object with an array 'conversions' containg multiple objects of the same type of the one above.

  - Each integer of the specified range correspondes to an object, and vice versa;
  - The objects must be in ascending order (by 'input' value);
  - The conversion of each integer of the range must be computed asynchronously.

  Output example for route [http://localhost:8080/romannumeral?min=7&max=9](http://localhost:8080/romannumeral?min=7&max=9):

  ```
  {
    conversions: [
      {"input": "7", "output": "VII"},
      {"input": "8", "output": "VIII"},
      {"input": "9", "output": "IX"}
    ]
  }
  ```

## Tools

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/260px-Unofficial_JavaScript_logo_2.svg.png" width="100" height="100">&nbsp;&nbsp;&nbsp;&nbsp;[<img src="https://avatars.githubusercontent.com/u/9950313?s=200&v=4" width="100" height="100">](https://nodejs.org/)<img src="https://www.google.com/search?q=npm&tbm=isch&ved=2ahUKEwjUy9uYq-L2AhVmif0HHeirBH8Q2-cCegQIABAA&oq=npm&gs_lcp=CgNpbWcQAzIHCCMQ7wMQJzIHCCMQ7wMQJzIFCAAQgAQyBQgAEIAEMgQIABAeMgQIABAeMgQIABAeMgQIABAeMgQIABAeMgQIABAeOgQIABAYUI4EWMcKYIQNaABwAHgAgAF0iAH3BZIBAzAuN5gBAKABAaoBC2d3cy13aXotaW1nwAEB&sclient=img&ei=tEU-YtShBOaS9u8P6NeS-Ac&bih=912&biw=960#imgrc=47ie_e0mINyxvM&imgdii=mjcFGa2lqvyZdM" width="100" height="100">&nbsp;&nbsp;&nbsp;&nbsp;

- Node.js: v17.8.0
- Node Package Manager (npm): version 8.5.5

## Setup

After making sure the tools above are installed, you should clone this repository by opening a terminal window and typing the following command:

```
git clone https://github.com/rrpereira/roman-server.git
```

Then, navigate to the new 'roman-server' folder and install the project dependencies. Run:

```
cd roman-server
npm i
```

This should be enough to run the server as well as to test it.

## Execution

To start the server make sure you are in the root folder 'roman-server' of the project. Then, simply type and run `npm start`. You should see something like this:

```
Server is runnning on http://localhost:8080
```

If you change something in the server, it will by automatically restarted after saving the changes.

You can also test the server (against pre-defined scenarios) by typing and running `npm test`. Changing and saving something in the server will automatically execute the tests again.

## Code explanation

### Project Structure

```
roman-server
├── config
│   └── config.env
├── node_modules
│   └── (...)
├── server
│   ├── routes
│   │   └── router.js
│   └── services
│       └── services.js
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── README.md
├── server.js
└── server.test.js
```

### [server.js](server.js) and [app.js](app.js)

[server.js](server.js) contains all of the server configurations, namely the port in which the server will be listening requests and the module used for logs. Note that this is separated from [app.js](app.js) to allow the use of the express application by other components which require different configurations.

### [router.js](/server/routes/router.js)

This is the file that redirects the routes to the correct service. In the current scenario, there is only one possible route `/romannumeral` that triggers `toRoman` function. All the others are answered with a JSON object containing an error message.

### [services.js](/server/services/services.js)

[services.js](/server/services/services.js) contains all of the conversion logic from arabic to roman numeral.

Inside `toRoman` function callback, the if statment evaluates the validity of the query parameters. First, `numberIsValid` checks if the route has a single and valid value to convert.

- If so, the value is converted to roman by `arabicToRoman` function, which returns the object that is sent back to the client (assuming there are no errors).

If not, it checks if it has a range of values to convert with `rangeIsValid`.

- If `rangeIsValid` evaluates to `true`, the server calls `arabicToRoman` function for each value in the range asynchronously.
- The for loop iterates through the values of the range in ascending order. In each iteration a new promise is created and stored in an array (which preserves the order).
- `Promise.all` waits for the values to be converted and stored as objects in the correct position of the array `results`. This array is then binded to an object that is sent back to the client (assuming there are no errors).

Otherwise, it returns a JSON object containing an error message.

Function `arabicToRoman` contains the most important logic of the server. The only argument of this function is the value to be converted, passed as a `string`. To make this process asynchronous, this function returns a `Promisse`, which in turn returns an object (with the original and the converted value) and stores it in the correct position in the array `results`. With this, the server can process value `4` before processing `2`, or `5` before `1`, in the range [1,5], for example.

The algorithm of this function is not the best nor the cleanest out there, yet I decided to apply the one that I have thought about because it was one of the rules of the project. Nevertheless, in normal circumstances I would apply the best solution possible. Now, lets break down the core of this function:

- The array symbols contains the relevant roman symbols for the corresponding place of each digit in the arabic number. For example, in number `2035`, the place of digit `5` is ones, therefore we must look at `symbols[0]` object, and `0` is in hundreds, therefore we must look at `symbols[2]`. So, `symbols[0]` corresponds to ones, `symbols[1]` to tens, `symbols[2]` to hundreds and `symbols[3]` to thousands;
- `numeral` stores the resulting roman numeral;
- The for loop iterates over each digit of that number, starting in the most significant one. At the same time, it iterates through `symbols` in descending order.
- Finally, the current `digit` falls in one of the following cases:
  - belongs to range [1,4[ -> concatenates `symbols[j].value` to the resulting string `digit` times;
  - is equal to 4 -> the conversion is immediate with `symbols[j].half`;
  - belongs to range [5,9[ -> concatenates `symbols[j].half`, and then concatenates `symbols[j].value` to the resulting string `digit - 5` times;
  - is equal to 9 -> concatenates `symbols[j].value` and `symbols[j+1].value` to the resulting string.

At the end of the loop, `numeral` has the converted roman numeral.

Function `numberIsValid` checks if:

- the `query` parameter exists;
- the query has one parameter;
- `qwery` parameter only has digits;
- the value belongs to range [1,3999].

Function `rangeIsValid` checks if:

- `min` parameter exists;
- `max` parameter exists;
- the query has two parameters;
- `min` parameter only has digits;
- `max` parameter only has digits;
- the values belong to range [1,3999];
- `min` parameter is not equal nor greater than `max`.

### [server.test.js](/server.test.js)

The file [server.test.js](/server.test.js) contains tests to check if the server returns the expected responses to the client. Each `it()` tests a route with different parameters, and three aspects are being checked in general:

- the `content-type` in the response headers;
- the HTTP status code;
- the body of the response.

To test the route with the greatest range possible, I decided to use an existing module (`romans`) to generate the expected response body. When running the test, the expected matches the actual response body, which means function `arabicToRoman` is working properly.

<!--How to use multiple threads to execute JavaScript in parallel:
https://nodejs.org/api/worker_threads.html

How does Node.js processes requests (hint: it doesn't use parallelism)?
https://stackoverflow.com/questions/34855352/how-in-general-does-node-js-handle-10-000-concurrent-requests

Promisse.all() doesn't use parallel processing!
https://dev.to/gbourne/the-power-of-javascript-promise-all-12ag

How does Node.js handles multiple requests?
https://stackoverflow.com/questions/34855352/how-in-general-does-node-js-handle-10-000-concurrent-requests-->
