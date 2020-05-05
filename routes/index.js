const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva', vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', vacantesController.agregarVacante);

    // mostrar vacante
    router.get('/vacante/:url', vacantesController.mostrarVacante);

    router.get('/vacante/editar/:url', vacantesController.editarVacante);
    router.post('/vacante/editar/:url', vacantesController.actualizarCamoposVante);


    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    // autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarusuario);



    return router;
}