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

// Opciones de configuración para multer 
const configuracionMulter = {

    // Tamaño máximo del archivo en bytes
    limits: {
        fileSize: 30000000,
    },

    // Dónde se almacena el archivo
    storage: (fileStorage = multer.diskStorage({

        destination: (req, res, cb) => {
            cb(null, `${__dirname}../../uploads`);
        },
        
        filename: (req, file, cb) => {
            const extension = file.mimetype.split("/")[1];
            cb(null, `${shortid.generate()}.${extension}`);
        },
    })),

};


// Función que sube el archivo
const upload = multer(configuracionMulter).single("archivo");

/*VER */

router.get('/hotelesAdmin', isLoggedIn, roles, async (req, res) => {
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
        const hoteles = await pool.query('Select * from hotel');

        res.render('hotel/list', {

            layout: "main",
            loginAdmin,
            loginGeneral,
            hoteles
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});



router.get('/', async (req, res) => {
  
    try {
        const hoteles = await pool.query('Select * from hotel');
        res.render('hotel/list2', {  
            layout: "main",
         
            hoteles
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});




router.get('/Detailhotel/:id', async (req, res) => {
  
    try {
        const { id } = req.params;

        const hotel = await pool.query('Select * from hotel where id = ? ',[id]);

        res.render('hotel/Detallehotel', {

            layout: "main",
            hotel:hotel[0]
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

/*AGREGAR  */
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
       

        res.render('hotel/add', {

            layout: "main",
            loginAdmin,
            loginGeneral,
            
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});
router.post('/add',upload, [
    check('nombre').not().isEmpty().withMessage('Ingrese el Hotel'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('/hoteles');
    } else {
        const { filename } = req.file;
        const archivo = filename;

        const { nombre,email,phone,direccion,descripcion,ubicacion,informacion } = req.body;

        const hoteles = {
            nombre,email,phone,direccion,archivo,descripcion,ubicacion,informacion
        };
        try {
            await pool.query('INSERT INTO hotel set ?', [hoteles]);
            req.flash('success', 'Hotel guardado');
            res.redirect('/hoteles');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('/hoteles');
        }
    }
});

module.exports = router;