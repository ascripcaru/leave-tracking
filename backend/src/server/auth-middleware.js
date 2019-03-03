import axios from 'axios'

const http = axios.create({ baseURL: process.env.AUTH_URL })

async function withAuth(req, res, next) {
    try {
        const { data } = await http.get('/verify', { headers: { authorization: req.headers.authorization } })
        req.token = data
        next()
    } catch (error) {
        const { status, data } = error.response
        res.status(status).json(data)
    }
}

async function getMe(req, res, next) {
    try {
        const me = await http.get('/me', { headers: { authorization: req.headers.authorization } })
        res.json(me.data)
    } catch (error) {
        const { status, data } = error.response
        res.status(status).json(data)
    }
}

export { withAuth, getMe }
