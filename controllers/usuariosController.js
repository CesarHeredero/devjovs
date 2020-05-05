const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');


exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis'
    })
}

exports.validarRegistro = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El mail es obligatorio').isEmail();
    req.checkBody('password', 'La contraseña es obligatorio').notEmpty();
    req.checkBody('confirmar', 'La contraseña obligatorio').notEmpty();
    req.checkBody('confirmar', 'el password es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if (errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis',
            mensajes: req.flash(),
        })
        return;
    }

    next();

}

exports.crearUsuario = async(req, res, next) => {
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesion',
    });
}