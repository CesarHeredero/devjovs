const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
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
    const vacante = await Vacante.findOne({ url: req.params.url });

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
    req.sinitizeBody('titulo').escape();
    req.sinitizeBody('empresa').escape();
    req.sinitizeBody('ubicacion').escape();
    req.sinitizeBody('salario').escape();
    req.sinitizeBody('contrato').escape();
    req.sinitizeBody('skills').escape();

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