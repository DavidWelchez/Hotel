const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');

const pool = require('../database');
const helpers = require('./helpers');
const { ResultWithContext } = require('express-validator/src/chain');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  console.log('Buenas', rows);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Bienvenido, ' + user.nombres));
    } else {
     return done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }
  } else {
    return done(null, false, req.flash('message', 'El correo o la contraseña no son válidas.'));
  }
}));

//SIGN UP
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email', 
  passwordField: 'password',
  passReqToCallback: true
}, 
 async (req, email, password, done) => {
  // [
  //   check('identidad').not().isEmpty().withMessage('Debe agregar el número de identidad').matches(/^[0-9]+$/).withMessage('La identidad solo debe tener números, no espacios ni guiones'),
  
  //   check('nombres').not().isEmpty().withMessage('Debe agregar los nombres'),
  
  //   check('email').isEmail().withMessage('Correo no válido'),
  
  //   check('password').not().isEmpty().withMessage('Debe agregar una contraseña')
  //     .isLength({ min: 5 }).withMessage('La contraseña debe de contener mas de 5 caracteres')
  //     .matches(/\d/).withMessage('La contraseña debe contener al menos un numero'),
  
  // ]
  // //VALIDAR SI HAY ERRORES
  // const errors = validationResult(req);
  // const messages = [];


  // if (!errors.isEmpty()) {

  //   errors.array().map((error) => {
  //     messages.push({ message: error.msg });

  //   });
  //   req.flash('messages2', messages);
  //   res.redirect('/registro');
  // }
  // else 
  // {
    const { identidad, nombres, apellidos, telefono, pais, ciudad, perfil, colegiacion, fechaNacimiento } = req.body;
    console.log(req.body);
    var permisoGeneral = 1;
    const usedUser = await pool.query('SELECT * FROM users WHERE email = ? ', [email]);
  
      if (usedUser[0]==null){
              const newUser = {
                  identidad,
                  email,
                  password,
                  nombres,
                  apellidos,
                  telefono,
                  pais,
                  ciudad,
                  perfil,
                  colegiacion,
                  permisoGeneral,
                  fechaNacimiento
              };
        newUser.password = await helpers.encryptPassword(password);
        // Saving in the Database
        const result = await pool.query('INSERT INTO users SET ? ', [newUser]);
        console.log(result);
        newUser.id = result.insertId;
        return done(null, newUser);
      }else{
        return done(null, false, req.flash('message', 'El correo ingresado ya está en uso.'));
      }
  //}




}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});