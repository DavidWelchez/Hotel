const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../database');
const { isLoggedIn ,} = require('../lib/auth'); 
const { roles ,} = require('../lib/rol'); 
const helpers = require('../lib/helpers');
const shortid = require("shortid");
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');

//RUTA GET GENERAL
router.get('/', async(req, res) => {
    try {
        const eventos = await pool.query('SELECT * FROM evento');
        res.render('eventos/list', {
            layout: 'main',
            eventos
        });
    } catch (error) {
    }
});

//RUTA GET ADMIN LIST
router.get('/eventosAdmin', isLoggedIn, async (req, res) => {
    try {
        const eventos = await pool.query('SELECT * FROM evento');
        const formatYmd = date => date.toISOString().slice(0, 10);
        eventos.forEach(element => {
            //element.fecha = element.fecha.toDateString();
            element.fecha = formatYmd(element.fecha)
            //si hay mas fechas las pones aqui donde va lo de año 
        });
        res.render('eventos/adminList', {
            layout: "main",
            eventos
        });
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }
});

//RUTA GET ADD
router.get('/add', isLoggedIn, roles, async (req, res) => {
    var loginAdmin = false;
    var loginGeneral = false;

    rol = req.user.rol;
    if (rol == "Admin") {
        loginAdmin = true;
    }
    if (rol == "General") {
        loginGeneral = true;
    }

    try {
        res.render('eventos/add', {
            layout: "main",
            loginAdmin,
            loginGeneral
        });
    } 
    catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }
});

//RUTA POST ADD
router.post('/add', isLoggedIn, async (req, res) => {
    const { nombre, lugar, ubicacionLugar, precio, fecha, horaInicio, horaFinal } = req.body;
    const evento = { 
        nombre, lugar, ubicacionLugar, precio, fecha, horaInicio, horaFinal };
    try {
        await pool.query('INSERT INTO evento set ?', [evento]);
        res.redirect('/eventos/eventosAdmin');
    } catch (error) {
    }
});

//RUTA GET EDIT
router.get('/edit/:id', isLoggedIn, async(req, res) => {
    try {
        const { id } = req.params;
        const evento = await pool.query('SELECT * FROM evento WHERE id = ?', [id]);
        const formatYmd = date => date.toISOString().slice(0, 10);
        evento.forEach(element => {
            //element.fecha = element.fecha.toDateString();
            element.fecha = formatYmd(element.fecha)
            //si hay mas fechas las pones aqui donde va lo de año 
        });
        res.render('eventos/edit', { evento: evento[0] });
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
    }

});

//RUTA POST EDIT
router.post('/edit/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const { nombre, lugar, ubicacionLugar, precio, horaInicio, horaFinal, fecha } = req.body;
    const newEvento = {
        nombre,
        lugar,
        ubicacionLugar,
        precio,
        horaInicio,
        horaFinal,
        fecha
    };
    try {
        await pool.query('UPDATE evento SET ? WHERE id = ?', [newEvento, id]);
        res.redirect('/eventos/eventosAdmin');
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
    }
});


//RUTA GET DETALLES
router.get('/detalles/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await pool.query('SELECT * FROM evento WHERE id = ?', [id]);
        const eventoDetalles = await pool.query('SELECT * FROM eventodetalle WHERE eventoId = ?', [id]);
        res.render('eventos/details', { 
            evento: evento[0], 
            eventoDetalles
        });
    } catch (error) {
    }
});

//RUTA GET ADD DETALLES
router.get('/detalles/add/:id', isLoggedIn, async(req,res) =>{
    try {
        const { id } = req.params;
        const evento = await pool.query('SELECT * FROM evento WHERE id = ?', [id]);
        res.render('eventos/addDetails', { evento: evento[0] });
    } catch (error) {
    }
});

//RUTA POST ADD DETALLES
router.post('/detalles/add/:eventoId', isLoggedIn, async(req, res) => {
    const { eventoId } = req.params;
    const { codigo, tema, expositor, horaInicio, horaFinal } = req.body;
    const eventoDetalle = {
        codigo,
        eventoId, 
        tema,
        expositor,
        horaInicio,
        horaFinal
    };
    try {
        await pool.query('INSERT INTO eventodetalle set ?', [eventoDetalle]);
        res.redirect('/eventos/detalles/'+eventoId);
    } catch (error) {
    }
});

//EXPORTAR MODULO
module.exports = router;