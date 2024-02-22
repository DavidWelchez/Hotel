
const express = require('express');
const router = express.Router();
const { isLoggedIn,isnotLoggedIn } = require('../lib/auth');

router.get('/', async (req, res) => {
   
    
    if (req.user) {
        var loginAdmin = false;
    var permisoValidador = false;
    rol = req.user.rol;

        if (req.user.rol == "Admin") {
            loginAdmin = true;
        }
        if (req.user.permisoValidador == "1") {
            permisoValidador = true;
        }
        try {
            res.render('index', {
           
                loginAdmin,
                permisoValidador
                
            
              });
            
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('/');
        }
    
    
       
    } else {
        try {
            res.render('index', {
           
                
                
            
              });
            
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('/');
        }
    }
  

});

//RUTA GET PARA POLITICA DE PRIVACIDAD APP
router.get('/politica-privacidad', async (req, res) => {
    try {
        res.render('politica', {  
            layout: "main"
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }
});

module.exports = router;