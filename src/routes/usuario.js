const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../database');
const { isLoggedIn ,} = require('../lib/auth'); 
const { roles ,} = require('../lib/rol'); 
const helpers = require('../lib/helpers');
const shortid = require("shortid");
const { check } = require('express-validator');
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// Opciones de configuración para multer 
const configuracionMulter = {
  
    // Tamaño máximo del archivo en bytes
    limits: {
      fileSize: 30000000,
    },
    
    // Dónde se almacena el archivo
    storage: (fileStorage = multer.diskStorage({
        
      destination: (req, res, cb) => {
        console.log('sii');
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


//const { roles } = require('../lib/auth');      

//ADD
router.post('/add',
  [
    check('fullname').not().isEmpty().withMessage('Agregue el nombre completo'),

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
      res.redirect('/usuario');
    }


    else {
      const { fullname, email, username, password, idcargo,sucursal, rol } = req.body;
      const usuario = await pool.query('SELECT * FROM users WHERE username = ? ', username);
      const useemail = await pool.query('SELECT * FROM users WHERE email = ? ', email);
 


     
      if (usuario[0] == null) {
        if (useemail[0] == null) {


          let newUser = {
            fullname,
            username,
            password,
            rol,
            email,
            idcargo,
            sucursal

          };
          newUser.password = await helpers.encryptPassword(password);
          // Saving in the Database
          const result = await pool.query('INSERT INTO users SET ? ', newUser);
          req.flash('success', 'Usuario  guardado ');
          res.redirect('/usuario');

        }
        else {
          req.flash('message', 'Correo en uso ');
          res.redirect('/usuario');
        }
      }
      else {
        req.flash('message', 'nombre de usuario');
        res.redirect('/usuario');
      }

    }
  });
  //LISTAR 
router.get('/', isLoggedIn,roles, async (req, res) => {
    var loginAdmin = false;
    var loginGeneral = false;

    rol = req.user.rol;
    if(rol == "Admin") {
        loginAdmin = true;
        }
        if(rol == "General") {
            loginGeneral = true;
            }
    const usuario = await pool.query('Select * from users');


    res.render('usuario/list', { 
        
        layout: "main",
        loginAdmin,
        loginGeneral,
        usuario, 
            });
});

router.get('/delete/:id',isLoggedIn, async (req, res) => {
  const { id } = req.params;
  
  try {
      await pool.query('DELETE  FROM users WHERE id = ?', [id]);
      req.flash('success', 'Usuario eliminado');
      res.redirect('back');
  } catch (error) {
      req.flash('messageErrores', '¡Ups! Algo salió mal');
      res.redirect('back');
  }


});

  
// EDITAR CONTRASEÑA

router.post('/editpass/:email', async (req, res) => {
    const { email } = req.params;
    const { password } = req.body;
    const newusuario = {
        password
        
    };
    newusuario.password = await helpers.encryptPassword(password);
    await pool.query('UPDATE users set ? WHERE email = ?', [newusuario, email]);
    req.flash('success', 'Contraseña actualizada');
    res.redirect('back');
});


/*EDITAR USUARIO*/
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  
  const { fullname,username,email ,rol, idcargo, sucursal} = req.body;
  //console.log(newusuario)
  const newusuario = {
      fullname, username,
      rol, email,
      idcargo, sucursal

      
  };
  await pool.query('UPDATE users set ? WHERE id = ?', [newusuario, id]);
  req.flash('success', 'Usuario actualizado');
  res.redirect('/usuario');
});







/*BUSCAR*/ 


router.post('/', isLoggedIn, roles, async (req, res) => {
  var loginAdmin = false;
  var loginGeneral = false;

  rol = req.user.rol;
  if (rol == "Admin") {
      loginAdmin = true;
  }
  if (rol == "General") {
      loginGeneral = true;
  }
  const { buscar } = req.body;
console.log(buscar);

const usuario = await pool.query(' Select * from users where  users.email =?', [buscar]);

res.render('usuario/list', {

      layout: "main",
      loginAdmin,
      loginGeneral,
      usuario,
   
      buscar
  });


});




router.get('/perfil', isLoggedIn, async (req, res) => {
    var loginAdmin = false;
    var loginGeneral = false;
    var loginMedico = false;
    var loginBodega = false;
    rol = req.user.rol;
    if(rol == "Admin") {
        loginAdmin = true;
        }
        if(rol == "General") {
            loginGeneral = true;
            }
            if(rol == "Medico") {
              loginMedico = true;
              }
              if(rol == "Bodega") {
                loginBodega = true;
                }
    const perfilusuario = req.user;
    res.render('usuario/perfil', { 
        
        layout: "main",
        loginAdmin,
        loginGeneral,
        perfilusuario , loginMedico, loginBodega
    });
});



router.post('/editperfil/:id', async (req, res) => {
    const { id } = req.params;
    const { nombres,apellidos } = req.body;
    const newusuario = {
      nombres,apellidos
        

        
    };
    await pool.query('UPDATE users set ? WHERE id = ?', [newusuario, id]);
    req.flash('success', 'Actualizado con exito');
    res.redirect('/usuario/perfil');
});




router.post('/editpassperfil/:id', async (req, res) => {
    const { id } = req.params;
    const { password,newpassword, confirmpassword} = req.body;

    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword ) {
          if (newpassword == confirmpassword) {
            const newpass= {
                password
                
            };
            newpass.password = await helpers.encryptPassword(newpassword);
            await pool.query('UPDATE users set ? WHERE id = ?', [newpass, id]);
            req.flash('success', 'Contraseña actualizada');
            res.redirect('/usuario/perfil'); 
          }else{
             req.flash('message', 'Contraseñas no coinciden');
             res.redirect('/usuario/perfil#contra'); 
          }
        
      } else {
         req.flash('message', 'Contraseña actual es incorrecta');
         res.redirect('/usuario/perfil#contra');       }
    } 


    
});



// router.get('/miperfil-imagen', isLoggedIn,roles, async (req, res) => {
//     var loginAdmin = false;
//     var loginGeneral = false;

//     rol = req.user.rol;
//     if(rol == "Admin") {
//         loginAdmin = true;
//         }
//         if(rol == "General") {
//             loginGeneral = true;
//             }
//     res.render('usuario/imagenUsuario', { 
        
//         layout: "main",
//         loginAdmin,
//         loginGeneral,
    
        
//     });
// });

router.post('/miperfil-imagen',upload, async (req, res) => {
  
     const {filename}=req.file;
     id = req.user.id;
     const archivo= filename;
    
    
;
    const newusuario = {
        
        archivo
        
    };
   
    await pool.query('UPDATE users set ? WHERE id = ?', [newusuario, id]);
    req.flash('success', 'Imagen guardada');
    res.redirect('/usuario/perfil');
    
    
});


module.exports = router;