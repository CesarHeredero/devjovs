const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
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