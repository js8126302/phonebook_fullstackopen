
const doubleId = (req, res, next) => {
    const id = req.params.id
    const numericId = Number(id)
    const doubleId = 2 * numericId
    req.doubleId = doubleId
    next()
}

app.route('/api/:id').get(doubleId,(req, res) => {
    const doubleId = req.doubleId
    return res.json({id: doubleId})
})
