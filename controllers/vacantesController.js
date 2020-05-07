const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        tagline: 'Llena el formulario y public tu vanate'
    });
}

exports.agregarVacante = async(req, res) => {
    const vacante = new Vacante(req.body);

    // Usuario autor de la vacante
    vacante.autor = req.user._id;

    //crear arreglo de skills
    vacante.skills = req.body.skills.split(',');

    // almacenar en la bd
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacante/${nuevaVacante.url}`);
}

exports.mostrarVacante = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');
    if (!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    });
}

exports.editarVacante = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url })

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        nombrePagina: `Editar - ${vacante.titulo}`
    })
}

exports.actualizarCamoposVante = async(req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({
        url: req.params.url
    }, vacanteActualizada, {
        new: true,
        runValidators: true
    });
    res.redirect(`/vacante/${vacante.url}`);
}

// validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    // sanitizar campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    //validar
    req.checkBody('titulo', 'Titulo es obligatorio').notEmpty();
    req.checkBody('empresa', 'Empresa es obligatorio').notEmpty();
    req.checkBody('ubicacion', 'Ubicación es obligatorio').notEmpty();
    req.checkBody('contrato', 'Contrato es obligatorio').notEmpty();
    req.checkBody('skills', 'Agrega una habilidad como minimo').notEmpty();

    const errores = req.validationErrors();
    if (errores) {
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen,
            tagline: 'Llena el formulario y public tu vanate',
            mensajes: req.flash()
        });
    }

    next();
}

exports.eliminarVacante = async(req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if (verificarAutor(vacante, req.user)) {
        // Todo bien
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error');
    }
    console.log(vacante);


}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    } else {
        return true;
    }
}

//subir cv en pdf
exports.subirCV = (req, res, next) => {
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
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

const configuracionMulter = {
    //5242880 = 5mb
    limits: { fileSize: 5242880 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/Uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('cv');


// contactar usuario
exports.contactar = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if (!vacante) return next();

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // almacenar vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensajes error
    req.flash('correcto', 'Se inscribió correctamete a la oferta');
    res.redirect('/');

}

exports.mostrarCandidatos = async(req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    if (vacante.autor != req.user._id.toString()) {
        return next()
    }

    if (!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos de la Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}