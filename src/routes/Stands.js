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
            cb(null, `${__dirname}../../uploads/casas`);
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

router.get('/StandsAdmin', isLoggedIn, roles, async (req, res) => {
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
        const casafarmaceutica = await pool.query('Select * from casafarmaceutica');

        res.render('Stands/listAdmin', {

            layout: "main",
            loginAdmin,
            loginGeneral,
            casafarmaceutica
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});



router.get('/', async (req, res) => {


    try {
        const casafarmaceutica = await pool.query('Select * from casafarmaceutica');

        res.render('Stands/list', {

            layout: "main",
           
            casafarmaceutica
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

router.get('/revista/:id', async (req, res) => {


    try {
        const { id } = req.params;
        const casafarmaceutica= await pool.query('Select * from casafarmaceuticadetalle where idcasafarmaceutica = ? ',[id]);

        res.render('Stands/Casa', {

            layout: "main",
            casafarmaceutica : casafarmaceutica[0]

           
            
        });

    } catch (error) {

        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

router.get('/stand', async (req, res) => {


    try {

        res.render('Stands/Página-1', {

            layout: "main",
           
            
        });

    } catch (error) {

        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});




router.get('/DetailStands/:id', async (req, res) => {
  
    try {
        const { id } = req.params;
        const casafarmaceutica = await pool.query('Select * from casafarmaceutica where id = ?',[id]);

        const casafarmaceuticaimagenes = await pool.query('Select * from casafarmaceuticadetalle where idcasafarmaceutica = ? ',[id]);

        res.render('Stands/Detalle', {

            layout: "main",
            casafarmaceutica:casafarmaceutica[0],
            casafarmaceuticaimagenes
        
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

router.get('/Detalle/:id', isLoggedIn, roles, async (req, res) => {
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


        const { id } = req.params;
        const casafarmaceutica = await pool.query('Select * from casafarmaceutica where id = ?',[id]);

        const casafarmaceuticaimagenes = await pool.query('Select * from casafarmaceuticadetalle where idcasafarmaceutica = ? ',[id]);

               res.render('Stands/imagenes', {
            layout: "main",
            loginAdmin,
            loginGeneral,
            casafarmaceutica: casafarmaceutica[0],
            casafarmaceuticaimagenes : casafarmaceuticaimagenes[0]
            
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
               res.render('Stands/add', {

            layout: "main",
            loginAdmin,
            loginGeneral,
            
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});


router.post('/add',upload,[
    check('nombre').not().isEmpty().withMessage('Ingrese la casa farmaceutica'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        try {
        const { filename } = req.file;
        const archivo = filename;

    
       

        const { nombre,titulo1,parrafo1,titulo2,parrafo2,titulo3,parrafo3,video  } = req.body;

        const casafarmaceutica = {
            nombre,archivo
        };
       
            await pool.query('INSERT INTO casafarmaceutica set ?', [casafarmaceutica]);

            const id = await pool.query('SELECT MAX(id) AS id FROM casafarmaceutica'),
            idcasafarmaceutica = id[0].id;

            const casa = {
                idcasafarmaceutica,titulo1,parrafo1,titulo2,parrafo2,titulo3,parrafo3,video
            };

                await pool.query('INSERT INTO casafarmaceuticadetalle set ?', [casa]);

            req.flash('success', 'Guardado con exito');
            res.redirect('/Stands/StandsAdmin');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');

            res.redirect('back');
        }
    }
});





router.post('/casaimagen1',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo1 = filename;

        const { id } = req.body;

        const casa = {
             archivo1
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});


router.post('/casaimagen2',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo2 = filename;

        const { id } = req.body;

        const casa = {
             archivo2
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});

router.post('/casaimagen3',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo3 = filename;

        const { id } = req.body;

        const casa = {
             archivo3
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});

router.post('/casaimagen4',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo4 = filename;

        const { id } = req.body;

        const casa = {
             archivo4
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});


router.post('/casaimagen5',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo5 = filename;

        const { id } = req.body;

        const casa = {
             archivo5
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});
router.post('/casaimagen6',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo6 = filename;

        const { id } = req.body;

        const casa = {
             archivo6
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});

router.post('/casaimagen7',upload, [
    check('id').not().isEmpty().withMessage('Ingrese todos los campos'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    } else {
        const { filename } = req.file;
        const archivo7 = filename;

        const { id } = req.body;

        const casa = {
             archivo7
        };

        try {
            await pool.query('UPDATE casafarmaceuticadetalle SET ? WHERE id = ?', [casa, id]);
            req.flash('success', 'Guardado con exito');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});


module.exports = router;