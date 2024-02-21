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
const transporter = require('../lib/email');
const qr = require("qrcode");


router.get('/', async (req, res) => {
  
    try { 
        res.render('auth/changePass', {  
            layout: "login",
        });
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('/');
    }

});

//RUTA PARA FORMULARIO DE CAMBIAR CONTRASEÑA
router.get('/password/:email', async (req, res) => {
  
    try { 
        const { email } = req.params;
        res.redirect('');
    } catch (error) {

    }

});

//RUTA PARA FORMULARIO DE CAMBIAR CONTRASEÑA
// router.get('/password/', async (req, res) => {
  
//     try { 
//         const { email } = req.params;
//         res.redirect('https://comenac2023.com/seguridad/password');
//     } catch (error) {
//         req.flash('messageErrores', '¡Ups! Algo salió mal');
//         res.redirect('/');
//     }

// });


router.get('/password', async (req, res) => {

    const { email } = req.body;

    res.render('auth/changePassEdit', {
        layout: "login",
    });


});

router.post('/password', async (req, res) => {

    const { email } = req.body;

    res.render('auth/changePassEdit', {
        email,
        layout: "login",
    });
});

router.post('/edit-password', [
    check('email').not().isEmpty().withMessage('Debe ingresar su correo electrónico'),
    check('password').not().isEmpty().withMessage('Debe ingresar su correo electrónico'),
], async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    }
    else{
        try {
            const { email, password } = req.body;
        
        const newusuario = {
            password
            
        };
        newusuario.password = await helpers.encryptPassword(password);
        await pool.query('UPDATE users set ? WHERE email = ?', [newusuario, email]);
        req.flash('success', 'Contraseña actualizada');
        res.redirect('/signin');
        } catch (error) {
            
        }
    }
});

router.post('/change-password', [
    check('email').not().isEmpty().withMessage('Debe ingresar su correo electrónico de inscripción'),
], async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('back');
    }
    else {


        try {
            const { email } = req.body;
            
            const inscripcionusuario = await pool.query('Select * from users where email = ?', [email]);

            if (inscripcionusuario[0] != null) {

                //OBTENER DATOS DE INSCRIPCION CREADA
                const ruta = 'https://comenac2023.com/seguridad/password';

               let htmlBody = ' <tbody><tr> '+
                '<td height="32" style="height:32px;min-height:32px;line-height:32px;font-size:1px"> '+
                  '&nbsp;'+
                '</td>'+
              '</tr>'+
              '<tr> '+
                '<td align="center">'+
                    '<h2 style="display:block;border:0px;text-decoration:none;border-style:none;color:#1d0d56;border-width:0" width="99" class="CToWUd" data-bit="iit">COMENAC 2023</h2>'+
                '</td>'+
              '</tr>'+
              '<tr>'+
                '<td height="32" style="height:32px;min-height:32px;line-height:32px;font-size:1px">'+
                  '&nbsp;'+
                '</td>'+
              '</tr>'+
            '</tbody>'+
            '<tbody><tr>'+
              '<td align="center" bgcolor="#ffffff">'+
                '<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
                  '<tbody><tr>'+
                    '<td valign="top">'+
                      '<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
  '<tbody><tr>'+
    '<td style="width:13%;min-width:40px" width="13%">&nbsp;</td>'+
    '<td align="center">'+
      '<table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">'+ 
            '<tbody><tr>'+
              '<td align="center" style="padding-top:16px">'+
                 '<h1 class="m_-323742713146453017f48" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:38px;font-weight:bold;color:#4b4b4b">'+
  '¡Hola!'+

'</h1>'+

              '</td>'+
            '</tr>'+
  
            '<tr>'+
              '<td align="center" style="padding-top:16px">'+
                 '<p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;font-weight:normal;color:#777777;max-width:380px;text-align:center">'+
  '¿Olvidaste tu contraseña? ¡Creemos una nueva!'+


'</p>'+

              '</td>'+
            '</tr>'+
  
            '<tr>'+
              '<td align="center" style="padding-top:16px">'+
                 '<div>'+
  
  `<form action="${ruta}" method="POST">`+
  '<table border="0" cellpadding="0" cellspacing="0" style="width:215px;border-spacing:0;border-collapse:collapse" width="215">'+
    '<tbody><tr>'+
    `<input type="hidden" value="${email}" `+
    'aria-describedby="button-addon2" name="email" hidden readonly>'+
      '<td align="center" height="43" style="border-collapse:collapse;background-color:#1cb0f6;border-radius:9px;white-space:nowrap">'+
      '<button type="submit" style="display:inline-block;width:100%;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:19px;color:#ffffff;text-align:center;text-decoration:none;background-color:#1d0d56;border-radius:14px;border-top:12px solid #1d0d56;border-bottom:12px solid #1d0d56;text-transform:uppercase">Cambiar contraseña</button>'+  
    //   `<a href="${ruta}" style="display:inline-block;width:100%;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:19px;color:#ffffff;text-align:center;text-decoration:none;background-color:#1d0d56;border-radius:14px;border-top:12px solid #1d0d56;border-bottom:12px solid #1d0d56;text-transform:uppercase" target="_blank">`+
    //       '&nbsp;&nbsp;Cambiar contraseña'+
'&nbsp;&nbsp;'+
        '</a>'
      '</td>'
    '</tr>'+
  '</tbody></table>'+
  '</form>'+

  
'</div>'+

              '</td>'+
            '</tr>'+
  
            '<tr>'+
              '<td align="center" style="padding-top:16px">'+
                 '<p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;font-weight:normal;color:#777777;max-width:380px;text-align:center">'+
  'Si no quieres cambiar tu contraseña, puedes obviar este correo.'+


'</p>'+

              '</td>'+
            '</tr>'+
          
        
      '</tbody></table>'+
    '</td>'+
    '<td style="width:13%;min-width:40px" width="13%">&nbsp;</td>'+
  '</tr>'+
'</tbody></table>'+

                    '</td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td height="50" style="height:50px;min-height:50px;line-height:50px;font-size:1px;border-bottom:2px solid #f2f2f2">'+
                      '&nbsp;'+
                    '</td>'+
                  '</tr>'+
                '</tbody></table>'+
              '</td>'+
            '</tr>'+
          '</tbody>';
                //CORREO
                await transporter.sendMail({
                    from: 'COMENAC 2023 <inscripciones@comenac2023.com>',
                    to: email,
                    subject: 'Cambio de contraseña',
                    attachDataUrls: true,
                    html: htmlBody
                }, function (error, info) {
                    if (error) {

                    }
                    else {
                        
                    }
                });

                req.flash('success', 'Revisa tu correo electrónico. Revisa también el SPAM');
                res.redirect('/');

            } else {
                req.flash('messageErrores', 'El correo electrónico no tiene una inscripción creada');
                res.redirect('back');
            }


        } catch (error) {

            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
            
        }
    }
});

//RUTA PARA REENVIAR CORREOS CON QR A INSCRIPCIONES PRESENCIALES
router.post('/resend-emails',  async (req, res) => {
  const errors = validationResult(req);
  const messages = [];
  if (!errors.isEmpty()) {

      errors.array().map((error) => {
          messages.push({ message: error.msg });
      });
      req.flash('messages2', messages);
  }
  else {
      try {

          const modalidad = 'Presencial'

          // const inscripciones = await pool.query('Select * from inscripcion where modalidad = ?', [modalidad]);

          const inscripciones = [{"email": 'diego232.lopez@gmail.com'}, {"email": 'davidwelchez@gmail.com'}, 
          {"email": 'patrocinadores@comenac2023.com'}, {"email" : 'soporte-tecnico@comenac2023.com'}, {"email": 'diegolopez@comenac2023.com'}, 
          {"email": 'welchezd@gmail.com'}, {"email": 'diego.lopez@auraminerals.com'}, {"email": 'comenac23@gmail.com'}, {"email": 'doctor@comenac2023.com'}, 
          {"email": 'diego232.lopez@gmail.com'}];

          if (inscripciones[0] != null) {

            //CICLO FOR
            for (let i = 0; i < inscripciones.length; i++) {
              const email = inscripciones[i].email;
              //OBTENER RUTA CON EMAIL
              const ruta =
                "https://comenac2023.com/inscripcion/inscripcion/ver/inscripcion/" +
                email;
              //imagen QR;
              let imagen = await qr.toDataURL(ruta);
              //CORREO
              await transporter.sendMail(
                {
                  from: "COMENAC 2023 <inscripciones@comenac2023.com>",
                  to: email,
                  subject: "¡El momento ha llegado!",
                  attachDataUrls: true,
                  html:
                    '<h1>¡El Congreso Médico Nacional está por dar inicio!</h1><br> <h2>Te esperamos desde este miércoles 25 de octubre.</h2><br> <h2>No olvides el código QR único de tu inscripción, recuerda que también puedes ver el código en la sección de "Inscripción" iniciando sesión en el sitio web.</h2> <br>' +
                    '<div style="display: flex; justify-content: center;align-items: center;"><img src="' +
                    imagen +
                    '" width = "250"></div>',
                  //html: htmlString,
                },
                function (error, info) {
                  if (error) {
                  } else {
                    // console.log('Correo enviado: ' + info.response);
                  }
                }
              );
              console.log('Correo enviado: ' + email);
            }
          } else {
          }
      } catch (error) {
        console.log(error);
      }
  }
});




module.exports = router;