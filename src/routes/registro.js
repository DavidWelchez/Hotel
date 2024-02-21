const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../database');
const { isLoggedIn, isnotLoggedIn} = require('../lib/auth'); 
const { roles ,} = require('../lib/rol'); 
const helpers = require('../lib/helpers');
const shortid = require("shortid");
const { check } = require('express-validator');
const passport = require('passport');
const { body, validationResult } = require('express-validator');



//RUTA GET 
router.get('/', isnotLoggedIn, async(req, res) => {
    const paises = await pool.query('SELECT * FROM pais');
    const perfil = await pool.query('SELECT * FROM perfil');
    res.render('auth/signup', {
        layout: "main",
        paises, 
        perfil
    });
});


//RUTA POST PASSPORT SIGN UP
router.post('/', 
    passport.authenticate('local.signup', {
        successRedirect: '/inscripcion',
        failureRedirect: '/registro',
        failureFlash: true
      }));


//RUTA POST
// router.post('/', isnotLoggedIn, 
// [
//     check('identidad').not().isEmpty().withMessage('Agregue la identidad del usuario'),
//     check('nombres').not().isEmpty().withMessage('Agregue los nombres del usuario'),
//     check('apellidos').not().isEmpty().withMessage('Agregue los apellidos del usuario'),
//     check('email').isEmail().withMessage('Correo no valido').custom((value, {req, loc, path}) => {
//         if (value !== req.body.confirmEmail) {
//             throw new Error('Los correos no coinciden');
//         } else {
//             return value;
//         }
//     }),
//     check('password').not().isEmpty().withMessage('Debe agregar una contraseña').isLength({ min: 5 }).withMessage('La contraseña debe de contener mas de 5 caracteres')
//     .matches(/\d/).withMessage('La contraseña debe contener al menos un numero'),
//     check('colegiacion').not().isEmpty().withMessage('Agregue el número de colegiación')
// ], async(req, res) => {
//     const errors = validationResult(req);
//     const messages = [];
//     if (!errors.isEmpty()) {
//         errors.array().map((error) => {
//             messages.push({ message: error.msg });
//         });
//         req.flash('messages2', messages);
//         res.redirect('/registro');
//       }
//       else {
//         const { identidad, email, password, nombres, apellidos, telefono, pais, ciudad, perfil, colegiacion } = req.body;
//         var permisoGeneral = 1;
//         const usedUser = await pool.query('SELECT * FROM users WHERE email = ?', email);
//         if(usedUser[0] == null)
//         {
//             const newUser = {
//                 identidad,
//                 email,
//                 password,
//                 nombres,
//                 apellidos,
//                 telefono,
//                 pais,
//                 ciudad,
//                 perfil,
//                 colegiacion,
//                 permisoGeneral
//             };
//             try {
//                 newUser.password = await helpers.encryptPassword(password);
//                 await pool.query('INSERT INTO users SET ?', [newUser]); 
//                 req.flash('success', 'Usuario registrado');
//                 res.redirect('/');
//             } catch (error) {
//                 console.log(error);
//             }
//         }
//         else
//         {
//             req.flash('message', 'Correo en uso ');
//             res.redirect('/registro');
//             console.log('Ya existe un usaurio con este correo electrónico. Por favor ingresa otro.');
//         }
//       }
// });

module.exports = router;