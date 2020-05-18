const Router = require('./index')
const router = new Router(4000)

router.use('/test', (req, res, next) => {
    console.log('yo the status is now 401')
    res.statusCode = 401
    next()
})

router.get('/test', (req, res) => {
    res.write(res.workRes ? res.workRes : 'hello world')
    res.end()
})

router.use('/test', (req, res, next) => {
    console.log('oops the status is actually now 403')
    res.statusCode = 403
    next()
})

router.use('/test', (req, res, next) => {
    console.log('doing some work....')
    res.workRes = 'res'
    next()
})

/** returns hello with name */
router.post('/hello', (req, res) => {
    req.on('data' , (chunk) => {
        const name = Buffer.from(chunk, 'utf-8').toString()
        res.write(`Hi ${name}!`)
        res.end()
    })
})

/**
 *  return posted object at 'a' property
 */
router.post('/haves-a', (req, res) => {
    if(req.body && req.body.a){
        res.write(req.body.a)
        res.end()
    } else{
        res.write('nope')
        res.end()
    }
})

const parseBody = (req, res, next) => {
    if (req.headers['content-type'] === 'application/json') {
        req.on('data', (chunk) => {
            const json = Buffer.from(chunk, 'utf-8').toString()
            try {
                req.body = JSON.parse(json)
            } catch (error) {
                console.warn(error)
            }
            next()
        })
    } else {
        next()
    }
}
router.use('/haves-a',parseBody )

router.start()
