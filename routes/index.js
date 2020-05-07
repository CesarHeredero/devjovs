const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    // mostrar vacante
    router.get('/vacante/:url', vacantesController.mostrarVacante);

    router.get('/vacante/editar/:url',
        authController.verificarUsuario,
        vacantesController.editarVacante
    );
    router.post('/vacante/editar/:url',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.actualizarCamoposVante
    );

    // Eliminiar vacante
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    );


    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    // autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarusuario);

    //cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // resetear pass
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    // resetar passwor - almacenar en la BD
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    // administracion
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Editar perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );

    // Recibir mensajes candidatos
    router.post('/vacante/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    );

    // mostrar candidatos por vacante
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );

    // buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes);

    return router;
}