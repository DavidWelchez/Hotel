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
router.get('/', isLoggedIn, async(req, res) => {
    try {
        const congresos  = await pool.query('SELECT * FROM congreso');
        res.render('congresos/list', { 
            congresos 
        });
    } catch (error) {
    }
});

//RUTA GET ADMIN LIST
router.get('/congresosAdmin', isLoggedIn, async(req, res) => {
    try {
        const congresos = await pool.query('SELECT * FROM congreso');
        const formatYmd = date => date.toISOString().slice(0, 10);
        congresos.forEach(element => {
            //element.fecha = element.fecha.toDateString();
            element.fecha = formatYmd(element.fecha)
            //si hay mas fechas las pones aqui donde va lo de año 
        });
        res.render('congresos/adminList', {
            congresos
        });
    } catch (error) {
    }
});

//RUTA GET ADD
router.get('/add', isLoggedIn, async(req, res) => {
    try {
        res.render('congresos/add');
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
    }
});

//RUTA POST ADD
router.post('/add', isLoggedIn, async (req, res) => {
    const { nombre, lugar, ubicacionLugar, fecha, horaInicio, horaFinal, valor } = req.body;
    const congreso = { 
        nombre, lugar, ubicacionLugar, fecha, horaInicio, horaFinal, valor };
    try {
        await pool.query('INSERT INTO congreso set ?', [congreso]);
        res.redirect('/congresos/congresosAdmin');
    } catch (error) {
    }
});

//RUTA GET EDIT
router.get('/edit/:id', isLoggedIn, async(req, res) => {
    try {
        const { id } = req.params;
        const congreso = await pool.query('SELECT * FROM congreso WHERE id = ?', [id]);
        const formatYmd = date => date.toISOString().slice(0, 10);
        congreso.forEach(element => {
            //element.fecha = element.fecha.toDateString();
            element.fecha = formatYmd(element.fecha)
            //si hay mas fechas las pones aqui donde va lo de año 
        });
        res.render('congresos/edit', { congreso: congreso[0] });
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
    }

//RUTA POST EDIT
router.post('/edit/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const { nombre, lugar, ubicacionLugar, horaInicio, horaFinal, fecha, valor } = req.body;
    const newCongreso = {
        nombre,
        lugar,
        ubicacionLugar,
        horaInicio,
        horaFinal,
        fecha, 
        valor
    };
    try {
        await pool.query('UPDATE congreso SET ? WHERE id = ?', [newCongreso, id]);
        res.redirect('/congresos/congresosAdmin');
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
    }
});


});

module.exports = router;