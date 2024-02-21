const express = require('express');
const router = express.Router();
const pool = require('../database');
const helpers = require('../lib/helpers');
const passport = require('passport');
const { isLoggedIn, isnotLoggedIn } = require('../lib/auth');
const { roles, } = require('../lib/rol');
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');


// SIGNUP
router.get('/signup/:modalidad', isnotLoggedIn,  async (req, res) => {

  

  try {
    const { modalidad } = req.params;

  res.render('auth/signup', {
    layout: "dashboard",
   
    
    modalidad
    

  });
    
  } catch (error) {
    req.flash('messageErrores', '¡Ups! Algo salió mal');
    res.redirect('back');
  }
});

// router.post('/signup', passport.authenticate('local.signup', {
//   successRedirect: '/usuario',
//   failureRedirect: '/signup',
//   failureFlash: true
// }));
router.post('/signup',
  [
    check('fullname').not().isEmpty().withMessage('Agregue el nombre del usuario'),

    check('username').not().isEmpty().withMessage('Agregue el usuario'),

    check('email').isEmail().withMessage('Correo no valido'),

    check('password').not().isEmpty().withMessage('Debe agregar una contraseña')
      .isLength({ min: 5 }).withMessage('La contraseña debe de contener mas de 5 caracteres')
      .matches(/\d/).withMessage('La contraseña debe contener al menos un numero'),

  ]
  , async (req, res) => {


    const errors = validationResult(req);
    const messages = [];


    if (!errors.isEmpty()) {

      errors.array().map((error) => {
        messages.push({ message: error.msg });

      });


      console.log(messages)
      req.flash('messages2', messages);
      res.redirect('/signup');
    }


    else {
      const { fullname, email, username, password, id_rol } = req.body;
      const usuario = await pool.query('SELECT * FROM users WHERE username = ? ', username);
      const useemail = await pool.query('SELECT * FROM users WHERE email = ? ', email);
 


      const rol = 'General';
      if (usuario[0] == null) {
        if (useemail[0] == null) {


          let newUser = {
            fullname,
            username,
            password,
            rol,
            email,
            id_rol

          };
          newUser.password = await helpers.encryptPassword(password);
          // Saving in the Database
          const result = await pool.query('INSERT INTO users SET ? ', newUser);
          req.flash('success', 'Usuario  guardado ');
          res.redirect('/usuario');

        }
        else {
          req.flash('message', 'Correo en uso ');
          res.redirect('/signup');
        }
      }
      else {
        req.flash('message', 'nombre de usuario');
        res.redirect('/signup');
      }

    }
  });


// SINGIN
router.get('/signin', isnotLoggedIn, (req, res) => {

 
  res.render('auth/signin',{
    layout: "login",

  });
});

router.post('/signin', isnotLoggedIn, (req, res, next) => {

  passport.authenticate('local.signin', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});



router.get('/profile', isLoggedIn,  async (req, res) => {
  var loginAdmin = false;
  var loginGeneral = false;
 
  rol = req.user.rol;
  if(rol == "Admin") {
      loginAdmin = true;
      }
      if(rol == "General") {
          loginGeneral = true;
          }
  res.render('profile', {
    layout: "dashboard",
     loginAdmin,
        loginGeneral
  }
  )
});


                    
module.exports = router;