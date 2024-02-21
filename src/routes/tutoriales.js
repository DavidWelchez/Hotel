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



router.get('/', async (req, res) => {
  
    try {
    
        res.render('tutoriales/list', {  
            layout: "main",
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('/');
    }

});







module.exports = router;