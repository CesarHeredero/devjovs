const passport = require('passport');
const moongose = require('mongoose');
const Vacante = moongose.model('Vacante');


exports.autenticarusuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// revisar si se esta autenticado
exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req, res) => {
    // consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id })

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y administra tus bacantes',
        vacantes
    })
}