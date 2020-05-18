

# Deel Backend Task

A router, similar to express, where you can register middlewares with various paths on it and they will be executed properly.

supports ``use/get/post``

  ## Middlewares
  Middleware functions can perform the following tasks:

-   Execute any code.
-   Make changes to the request and the response objects.
-   End the request-response cycle.
-   Call the next middleware function in the stack.

If the current middleware function does not end the request-response cycle, it must call  `next()`  to pass control to the next middleware function. Otherwise, the request will be left hanging.
  

## Usage

*initiate server*

    const Router = require('./index')
    const router = new  Router(<port>)
    /**
    register all your routes and middleware here
    **/
    router.start()
     
*register routes*

    router.get('/test', (req, res) => {
    res.write('hello world')
    res.end()
    })

register middlewares
	
    router.use('/test', (req, res, next) => {
    console.log('doing some work....')
	req.result = calculateSomething()
	console.log('done')
    next()
    })
    

> For more examples checkout the example.js file
