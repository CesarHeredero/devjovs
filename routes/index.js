const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva', vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', vacantesController.agregarVacante);

    // mostrar vacante
    router.get('/vacante/:url', vacantesController.mostrarVacante);

    router.get('/vacante/editar/:url', vacantesController.editarVacante);

    return router;
}