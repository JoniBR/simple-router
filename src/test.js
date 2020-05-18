const Router = require('./index')
const router = new Router(4000)
router.start()

router.use('/test', (req, res, next) => {
    console.log('yo the status is now 401')
    res.statusCode = 401
    next()
})

router.get('/test', (req, res) => {
    res.write('hello world')
    res.end()
})

router.use('/test', (req, res, next) => {
    console.log('oops the status is actually now 403')
    res.statusCode = 403
    next()
})