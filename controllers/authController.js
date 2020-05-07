const passport = require('passport');
const moongose = require('mongoose');
const Vacante = moongose.model('Vacante');
const Usuarios = moongose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

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
    const vacantes = await Vacante.find({ autor: req.user._id });

    console.log(vacantes);
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y administra tus bacantes',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerraste la sesión correctamente')
    return res.redirect('/iniciar-sesion');
}

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu pass',
        tagline: 'Si ya tienes cuenta pero olvidaste tu contraseña, coloca aquí tu email'
    })
}

exports.enviarToken = async(req, res, next) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error', 'No existe la cuenta');
        return res.redirect('/iniciar-sesion');
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 360000;

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    await enviarEmail.enviar({
        usuario,
        subject: 'Pasword reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu correo para recuperar tu contraseña');
    res.redirect('/iniciar-sesion');
}

exports.reestablecerPassword = async(req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', 'Caducado el enlace, intentalo de nuevo');
        return res.redirect('/reestablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    });
}

exports.guardarPassword = async(req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuario) {
        req.flash('error', 'Caducado el enlace, intentalo de nuevo');
        return res.redirect('/nuevo-password');
    }

    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();
    req.flash('correcto', 'Contraseña cambiada correctamente');
    res.redirect('/iniciar-sesion');
}