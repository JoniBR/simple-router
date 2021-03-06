const http = require('http')
const urlParser = require('url')

/**
 * 
 * @param {function} handlerFunc 
 */
function Handler(handlerFunc) {
    this.middlewares = []
    this.handlerFunc = handlerFunc

    this.process = async (req, res) => {
        let i = 0
        const next = function () {
            i++
            if (i < this.middlewares.length) {
                this.middlewares[i](req, res, next)
            } else {
                this.handlerFunc(req, res)
            }
        }.bind(this)
        this.middlewares.length ? this.middlewares[0](req, res, next) : this.handlerFunc(req, res)
    }

    /**
     * adds a middleware to this handler
     * @param {function} newMiddleware middleware function
     */
    this.registerMiddleWare = (newMiddleware) => {
        if (typeof newMiddleware !== 'function') {
            throw new Error('only callback functions can be registered as middleware.')
        }
        this.middlewares.push(newMiddleware.bind(this))
    }

}

/**
 * 
 * @param {number} port 
 */
function Router(port) {
    this.port = port
    this.routesToHandlers = {
        get: {},
        post: {}
    }
    this.routesToMiddleware = {}
    this.server = http.createServer((req, res) => {
        const handler = this.getHandler(req)
        handler.process(req, res)
    })

    /**
     * start the server on this.port
     */
    this.start = () => {
        this.server.listen(this.port, () => {
            console.info(`Server is listening on http://localhost:${port}`)
        })
    }
    /**
     * @param {string} route  path to register the handler to
     * @param {function} handler function that handler the incoming request
     * @param {string} method get or post
     */
    this.registerRoute = (route, handler, method) => {
        if (typeof handler !== 'function') {
            throw new Error('Callback function must be a function.')
        }
        this.routesToHandlers[method][route] = new Handler(handler)
        this.registerRouteMiddlewareToHandler(route, method)
    }

    /**
     * register a callback to a GET route
     * @param {string} route  the path of the route
     * @param {handler} handler a handler function to handle the request
     * @returns void
     */
    this.get = (route, handler) => {
        this.registerRoute(route, handler, 'get')
    }

    /**
      * register a callback to a POST route
      * @param {string} route the path of the route
      * @param {function} handler a callback function to handle the request
      * @returns void
      */
    this.post = (route, handler) => {
        this.registerRoute(route, handler, 'post')
    }

    /**
     * registers a middleware to a route
     * @param {string} route the path of the route
     * @param {function} middleware a middleware function (req,res,next)
     */
    this.use = (route, middleware) => {
        if (this.routesToMiddleware[route]) {
            this.routesToMiddleware[route].push(middleware)
        } else {
            this.routesToMiddleware[route] = [middleware]
        }

        for (const handlerRoute in this.routesToHandlers['get']) {
            if (handlerRoute === route) {
                const handler = this.routesToHandlers['get'][route]
                handler.registerMiddleWare(middleware)
            }
        }

        for (const handlerRoute in this.routesToHandlers['post']) {
            if (handlerRoute === route) {
                const handler = this.routesToHandlers['post'][route]
                handler.registerMiddleWare(middleware)
            }
        }
    }

    /**
     * get handler that handles the requests route.
     * @default to this.defaultHandler
     * @param {http.ClientRequest} req
     * 
     */
    this.getHandler = (req) => {
        const url = urlParser.parse(req.url, true);
        const method = req.method.toLowerCase()
        const handler = this.routesToHandlers[method][url.pathname]
        if (!handler) {
            return this.defaultHandler
        }
        return handler
    }

    /**
     * handles unregistered routes
     */
    this.defaultHandler = new Handler((req, res) => {
        const url = urlParser.parse(req.url, true);
        const method = req.method
        res.statusCode = 404
        res.end(`${method} ${url.pathname} is not supported.`, 'utf-8')
    })

    /**
    * registers middlewares of a route to a ne handler
    * @param {string} route the path of the route
    * @param {string} method get/post
    */
    this.registerRouteMiddlewareToHandler = (route, method) => {
        if (route in this.routesToMiddleware) {
            for (const middy of this.routesToMiddleware[route]) {
                this.routesToHandlers[method][route].registerMiddleWare(middy)
            }
        }
    }
}

module.exports = Router

