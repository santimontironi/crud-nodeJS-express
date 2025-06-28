function protegerRuta(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/login')
    }
}

module.exports = protegerRuta