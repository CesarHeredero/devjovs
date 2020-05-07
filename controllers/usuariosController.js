const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');


exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            console.log(error);
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'el archvio es muy grande, máximo 5mb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/editar-perfil');
            return;
        } else {
            return next();
        }

    });
}

// Opciones de multer
const configuracionMulter = {
    //5242880 = 5mb
    limits: { fileSize: 5242880 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/Uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

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

exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil de DebJobs',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        usuario: req.user
    });
}

exports.editarPerfil = async(req, res, next) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.password) {
        usuario.password = req.body.password;
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    await usuario.save();

    req.flash('correcto', 'Cambios guardados correctamente');

    res.redirect('/administracion');

}

exports.validarPerfil = (req, res, next) => {
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if (req.body) {
        req.sanitizeBody('password').escape();
    }

    req.checkBody('nombre', 'Nombre es obligatorio').notEmpty();
    req.checkBody('email', 'email es obligatorio').notEmpty();

    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('editar-perfil', {
            nombrePagina: 'Editar Perfil',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            mensajes: req.flash()
        });
    }
    next();
}