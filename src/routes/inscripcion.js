const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../database');
const { isLoggedIn, } = require('../lib/auth');
const { roles,permisoValidador } = require('../lib/rol');

const helpers = require('../lib/helpers');
const shortid = require("shortid");
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');
const transporter = require('../lib/email');

// Opciones de configuración para multer 
const configuracionMulter = {

    // Tamaño máximo del archivo en bytes
    limits: {
        fileSize: 30000000,
    },

    // Dónde se almacena el archivo
    storage: (fileStorage = multer.diskStorage({

        destination: (req, res, cb) => {
            
            cb(null, `${__dirname}../../uploads/comprobantes`);
        },

        filename: (req, file, cb) => {
            const extension = file.mimetype.split("/")[1];
            cb(null, `${shortid.generate() + '-' + req.user.id}.${extension}`);
        },
    })),

};


// Función que sube el archivo
const upload = multer(configuracionMulter).single("archivo");
/*VER */




router.get('/', isLoggedIn, async (req, res) => {

    try {




        const congreso = 1;
        const precongreso = 2;
        const id = req.user.id;



        const inscripciones = await pool.query('Select * from inscripcion');
        const congresoM = await pool.query('Select * from congreso where valor = ? ', [congreso]);
        const precongresos = await pool.query('Select * from congreso where valor = ? AND estado = 1', [precongreso]);


        const medicos = await pool.query('Select * from users where users.id = ? and users.perfil in (1) ', [id]);
        const Nomedicos = await pool.query('Select * from users where users.id = ? and users.perfil in (4) ', [id]);
        const jubilados = await pool.query('Select * from users where users.id = ? and users.perfil in (6) ', [id]);


        const PrecioMedicoCongresoPresencial = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (1) and congreso.valor = ?', ["Presencial", "1"]);
        const PrecioMedicoCongresoVirtual = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (1) and congreso.valor = ?', ["Virtual", "1"]);
        const PrecioMedicoPreCongreso = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (1) and congreso.valor = ?', ["Presencial", "2"]);

        const PrecioNoMedicoCongresoPresencial = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (4) and congreso.valor = ?', ["Presencial", "1"]);
        const PrecioNoMedicoCongresoVirtual = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (4) and congreso.valor = ?', ["Virtual", "1"]);
        const PrecioNoMedicoPreCongreso = await pool.query('Select precios.precio from precios,congreso,perfil where precios.perfil=perfil.id and precios.congreso=congreso.id and modalidad = ? and precios.perfil in (4) and congreso.valor = ?', ["Presencial", "2"]);

        const PrecioJubilados = '0';

        // console.log(PrecioMedicoCongresoPresencial, "PrecioMedicoCongresoPresencial")
        // console.log(PrecioMedicoCongresoVirtual, "PrecioMedicoCongresoVirtual")
        // console.log(PrecioMedicoPreCongreso, "PrecioMedicoPreCongreso")

        // console.log(PrecioNoMedicoCongresoPresencial, "PrecioNoMedicoCongresoPresencial")
        // console.log(PrecioNoMedicoCongresoVirtual, "PrecioNoMedicoCongresoVirtual")
        // console.log(PrecioNoMedicoPreCongreso, "PrecioNoMedicoPreCongreso")

        res.render('inscripcion/list', {
            inscripciones,
            congresoM: congresoM[0],
            precongresos,
            medicos,
            PrecioMedicoCongresoPresencial: PrecioMedicoCongresoPresencial[0],
            PrecioMedicoCongresoVirtual: PrecioMedicoCongresoVirtual[0],
            PrecioMedicoPreCongreso: PrecioMedicoPreCongreso[0],
            PrecioNoMedicoCongresoPresencial: PrecioNoMedicoCongresoPresencial[0],
            PrecioNoMedicoCongresoVirtual: PrecioNoMedicoCongresoVirtual[0],
            PrecioNoMedicoPreCongreso: PrecioNoMedicoPreCongreso[0],
            Nomedicos,
            jubilados,
            PrecioJubilados

        });

    } catch (error) {

        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});




router.get('/Detailinscripcion/:id', async (req, res) => {

    try {
        const { id } = req.params;

        const inscripcion = await pool.query('Select * from inscripcion where id = ? ', [id]);


        res.render('inscripcion/Detalleinscripcion', {

            layout: "main",
            inscripcion: inscripcion[0]
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

/*AGREGAR GET */
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


        res.render('inscripcion/add', {

            layout: "main",
            loginAdmin,
            loginGeneral,

        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

/*AGREGAR POST*/
router.post('/add', [
    check('modalidad').not().isEmpty().withMessage('Debe seleccionar la modalidad'),
    check('cuotasPago').not().isEmpty().withMessage('Debe seleccionar la cuota de pago'),
    check('eventoId').not().isEmpty().withMessage('Debe seleccionar el congreso'),
], isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    const messages = [];
    if (!errors.isEmpty()) {

        errors.array().map((error) => {
            messages.push({ message: error.msg });
        });
        req.flash('messages2', messages);
        res.redirect('/inscripcion');
    }
    else {


        try {
            const usuarioemail = req.user.email;

            const inscripcionusuario = await pool.query('Select * from inscripcion where usuario =?', [usuarioemail]);

            if (inscripcionusuario[0] == null) {

                const usuario = req.user.email;

                const { modalidad, eventoId, cuotasPago, PrecioMedicoCongresoPresencial, PrecioMedicoCongresoVirtual, PrecioMedicoPreCongreso } = req.body;

                let precio = 0;
                if (modalidad == "Presencial") {
                    precio = PrecioMedicoCongresoPresencial;
                }
                if (modalidad == "Virtual") {
                    precio = PrecioMedicoCongresoVirtual;
                }

                const precios = [];

                precios.push(precio, PrecioMedicoPreCongreso)

                //PRECIO TOTAL INSCRIPCION
                // let precioPreCon = parseFloat(PrecioMedicoPreCongreso);
                // const total =  parseFloat(precio) + precioPreCon;

                //ESTADO INSCRIPCION 1 = REGISTRADA, 2 = VALIDADA
                const estado = 1;


                const inscripcion = {
                    modalidad, cuotasPago, usuario, estado
                };
                await pool.query('INSERT INTO inscripcion set ?', [inscripcion]);
                const id = await pool.query('SELECT MAX(id) AS id FROM inscripcion'),
                    inscripcionId = id[0].id;
                //console.log(inscripcionId)


                //REMOVER ELEMENTO 0
                for (let i = 0; i < eventoId.length; i++) {
                    if (eventoId[i] === '0' || eventoId[i] === 0) {
                        eventoId.pop();
                    }
                }

                if (Array.isArray(eventoId)) {
                    for (let index = 0; index < eventoId.length; index++) {
                        const element = eventoId[index];
                        const elem2 = precios[index]
                        var inscripciondetalle = {
                            eventoId: element, inscripcionId, precio: elem2
                        };
                        await pool.query('INSERT INTO inscripciondetalle set ?', [inscripciondetalle]);
                    }

                } else {
                    const inscripciondetalle = {
                        inscripcionId, eventoId, precio
                    };
                    await pool.query('INSERT INTO inscripciondetalle set ?', [inscripciondetalle]);
                }

                //UPDATE DE TOTAL
                const totalInscripcion = await pool.query('Select sum(I.precio) as total from inscripciondetalle as I where I.inscripcionId = ? group by I.inscripcionId', [inscripcionId]);
                let total = totalInscripcion[0].total;
                await pool.query('UPDATE inscripcion SET total = ? WHERE id = ?', [total, inscripcionId]);

                //OBTENER DATOS DE INSCRIPCION CREADA
                const ruta = 'https://comenac2023.com/inscripcion/inscripcion/ver/inscripcion/' + usuario

                //imagen QR;
                let imagen = await qr.toDataURL(ruta);

                //OBTENER DETALLES
                const inscripcionSelect = await pool.query('Select * from inscripcion where usuario =?', [usuario]);

                const detalle = await pool.query('Select * from inscripciondetalle,congreso where congreso.id=inscripciondetalle.eventoId and  inscripcionId =? ', [inscripcionId]);

                let htmlString = '<h2>Tu inscripción al Congreso Médico Nacional ha sido registrada con éxito.</h2><br> <h2>Adjunto encontrarás el código QR único de tu inscripción, recuerda que también puedes ver el código en la sección de "Inscripción" iniciando sesión en el sitio web.</h2> <br>' +
                    '<div style="display: flex; justify-content: center;align-items: center;"> <img src="' + imagen + '" width = "250"> </div> <br>';
                htmlString += '<div>' +
                    '<table style="border:1px solid black;margin-left:auto;margin-right:auto;padding:2px;border-spacing:20px;"> ' +
                    '<thead> ' +
                    '<tr> ' +
                    '<th>Congreso</th>' +
                    '<th>Lugar</th> ' +
                    '<th>Hora de inicio</th> ' +
                    '<th>Hora Final</th> ' +
                    '</tr> ' +
                    '</thead> ' +
                    '<tbody> ';

                //CICLO PARA DETALLES DE EVENTOS
                for (let index = 0; index < detalle.length; index++) {
                    htmlString += '<tr> <td>' + detalle[index].nombre + '</td> <td>' + detalle[index].lugar + '</td> <td>' + detalle[index].horaInicio + '</td> <td>' + detalle[index].horaFinal + '</td> </tr>';
                }

                htmlString += '</tbody> ' +
                    '</table> ' +
                    '</div>';
                //CORREO
                await transporter.sendMail({
                    from: 'COMENAC 2023 <inscripciones@comenac2023.com>',
                    to: usuarioemail,
                    subject: '¡Tu inscripción ha sido registrada!',
                    attachDataUrls: true,
                    html: '<h1>Tu inscripción al Congreso Médico Nacional ha sido registrada con éxito.</h1><br> <h2>Adjunto encontrarás el código QR único de tu inscripción, recuerda que también puedes ver el código en la sección de "Inscripción" iniciando sesión en el sitio web.</h2> <br>' +
                        '<div style="display: flex; justify-content: center;align-items: center;"><img src="' + imagen + '" width = "250"></div>'
                    //html: htmlString,
                }, function (error, info) {
                    if (error) {

                    }
                    else {
                        // console.log('Correo enviado: ' + info.response);
                    }
                });
                //console.log('Imagen:' + imagen);


                req.flash('success', '¡Inscripción guardada con éxito!');
                res.redirect('/inscripcion/inscripcionUsuario');

            } else {
                req.flash('messageErrores', 'El usuario ya tiene una inscripción creada');
                res.redirect('/inscripcion/inscripcionUsuario');
            }


        } catch (error) {

            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('/inscripcion');
        }


    }
});




const qr = require("qrcode");


// app.post("/scan", (req, res) => {
//     req.body.url; const url ;
// if (url.length === 0) res.send( "Empty Data!");
// qr. toDataURL(url, (err, src) => {
// if (err) res.send( "Error occured");
// res.render("scan", { src });
// });
// });


router.get('/inscripcionUsuario', isLoggedIn, async (req, res) => {


    try {
        const usuario = req.user.email;
        const perfilusuario = req.user;
        const inscripcion = await pool.query('Select * from inscripcion where usuario =?', [usuario]);
        const formatYmd = date => date.toLocaleDateString('en-GB').slice(0, 10);
        inscripcion.forEach(element => {
            element.created_at = formatYmd(element.created_at)
        });
        const inscripcionId = inscripcion[0].id
        const cuotas1 = await pool.query('Select cuotasPago from inscripcion where usuario =? and  cuotasPago = ?', [usuario, '1']);
        const cuotas2 = await pool.query('Select cuotasPago from inscripcion where usuario =? and  cuotasPago = ?', [usuario, '2']);
        const cuotas3 = await pool.query('Select cuotasPago from inscripcion where usuario =? and  cuotasPago = ?', [usuario, '3']);

        const cuotasimagen1 = await pool.query('Select * from inscripcioncomprobantes where inscripcionId =? and  numeroComprobante = ?', [inscripcionId, '1']);
        const cuotasimagen2 = await pool.query('Select * from inscripcioncomprobantes where inscripcionId =? and  numeroComprobante = ?', [inscripcionId, '2']);
        const cuotasimagen3 = await pool.query('Select * from inscripcioncomprobantes where inscripcionId =? and  numeroComprobante = ?', [inscripcionId, '3']);

        const inscripciondetalle = await pool.query('Select * from inscripciondetalle,congreso where congreso.id=inscripciondetalle.eventoId and  inscripcionId =? ', [inscripcionId]);

        const usuariovirtualcomprobante = await pool.query('SELECT * FROM inscripcion I  INNER JOIN inscripcioncomprobantes IC ON I.id = IC.inscripcionId  WHERE I.modalidad = ? AND I.usuario = ? ', ['Virtual',usuario]);

        const usuariovirtual = await pool.query('SELECT * FROM inscripcion I  WHERE I.modalidad = ? AND I.usuario = ? ', ['Virtual',usuario]);

        

        const ruta = 'https://comenac2023.com/inscripcion/inscripcion/ver/inscripcion/' + usuario
        if (ruta.length === 0) res.send("Empty Data!");
        qr.toDataURL(ruta, (err, src) => {
            if (err) res.send("Error occured");


            res.render('inscripcion/listqr', {
                inscripcion: inscripcion[0],
                inscripciondetalle,
                src,
                ruta,
                perfilusuario,
                inscripcionId,
                cuotas1,
                cuotas2,
                cuotas3,
                cuotasimagen1: cuotasimagen1[0],
                cuotasimagen2: cuotasimagen2[0],
                cuotasimagen3: cuotasimagen3[0],
                usuariovirtual,usuariovirtualcomprobante
            });
        });
    } catch (error) {
        
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});


router.get('/inscripcion/ver/inscripcion/:usuario', isLoggedIn,permisoValidador, async (req, res) => {


    try {
        var loginAdmin = false;
        var permisoValidador = false;
        rol = req.user.rol;
    
            if (req.user.rol == "Admin") {
                loginAdmin = true;
            }
            if (req.user.permisoValidador == "1") {
                permisoValidador = true;
            }
        const { usuario } = req.params;

        const inscripcion = await pool.query('Select inscripcion.id,users.nombres,users.apellidos,inscripcion.usuario, inscripcion.created_at,inscripcion.modalidad,inscripcion.total, inscripcion.cuotasPago, inscripcion.confirmacionEntrada  from inscripcion ,users WHERE users.email=inscripcion.usuario and inscripcion.usuario =?', [usuario]);
        const inscripcionId = inscripcion[0].id

        const cuotasimagen = await pool.query('Select * from inscripcioncomprobantes where inscripcionId =? ', [inscripcionId]);

        const inscripciondetalle = await pool.query('Select * from inscripciondetalle,congreso where congreso.id=inscripciondetalle.eventoId and  inscripcionId =? ', [inscripcionId]);




        res.render('inscripcion/inscripcionver', {



            inscripcion: inscripcion[0],
            inscripciondetalle,
            cuotasimagen,
            loginAdmin,
            permisoValidador

        });
    } catch (error) {


        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});


router.post('/inscripcionUsuario/add', upload, [
    check('inscripcionId').not().isEmpty().withMessage('Ingrese la imagen'),
], isLoggedIn, async (req, res) => {
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


        const { filename } = req.file;
        const archivo = filename;

        const { inscripcionId, numeroComprobante } = req.body;

        const comprobante = {
            inscripcionId, numeroComprobante, archivo
        };
        try {
            await pool.query('INSERT INTO inscripcioncomprobantes set ?', [comprobante]);
            req.flash('success', 'Guardado con exito!');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});


router.post('/inscripcionUsuario/edit', upload, [
    check('inscripcionId').not().isEmpty().withMessage('Ingrese la imagen'),
], isLoggedIn, async (req, res) => {
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


        const { filename } = req.file;
        const archivo = filename;

        const { inscripcionId, numeroComprobante } = req.body;

        const comprobante = {
            archivo
        };
        try {
            await pool.query('UPDATE inscripcioncomprobantes SET ? WHERE id = ?', [comprobante, inscripcionId]);
            req.flash('success', 'Guardado con exito!');
            res.redirect('back');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    }
});






router.get('/inscripcionesAdminvirtual', isLoggedIn,permisoValidador, async (req, res) => {
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

        const inscripciones = await pool.query('Select * from inscripcion, users WHERE users.email=inscripcion.usuario and  modalidad = ? ORDER BY nombres ASC', ['Virtual']);
        const formatYmd = date => date.toLocaleDateString('en-GB').slice(0, 10);
        inscripciones.forEach(element => {
            element.created_at = formatYmd(element.created_at)
        });

        res.render('inscripcion/listAdmin', {
            inscripciones,
            loginAdmin,
            permisoValidador
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

router.get('/inscripcionesAdminp', isLoggedIn,permisoValidador, async (req, res) => {
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

        const inscripciones = await pool.query('Select * from inscripcion, users WHERE users.email=inscripcion.usuario and  modalidad = ? ORDER BY nombres ASC', ['Presencial']);
        const formatYmd = date => date.toLocaleDateString('en-GB').slice(0, 10);
        inscripciones.forEach(element => {
            element.created_at = formatYmd(element.created_at)
        });

        res.render('inscripcion/listAdminpresencial', {
            inscripciones,
            loginAdmin,
            permisoValidador
        });

    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});

router.post('/inscripcionesAdminp/buscar', isLoggedIn,permisoValidador, async (req, res) => {
    var loginAdmin = false;
    var permisoValidador = false;
    rol = req.user.rol;

        if (req.user.rol == "Admin") {
            loginAdmin = true;
        }
        if (req.user.permisoValidador == "1") {
            permisoValidador = true;
        }
    const { buscar } = req.body;

    const inscripciones = await pool.query('SELECT * FROM inscripcion I LEFT JOIN users U ON I.usuario = U.email WHERE I.modalidad = ? AND (I.Usuario LIKE ? OR U.nombres LIKE ? OR U.apellidos LIKE ? OR U.identidad LIKE ?)', ['Presencial', `%${buscar}%`, `%${buscar}%`, `%${buscar}%`, `%${buscar}%`]);
    const formatYmd = date => date.toLocaleDateString('en-GB').slice(0, 10);
    inscripciones.forEach(element => {
        element.created_at = formatYmd(element.created_at)
    });
    res.render('inscripcion/listAdminpresencial', {

        inscripciones,
        loginAdmin,
        permisoValidador,
        buscar
    });


});


router.post('/inscripcionesAdminvirtual/buscar', isLoggedIn,permisoValidador, async (req, res) => {
    var loginAdmin = false;
    var permisoValidador = false;
    rol = req.user.rol;

        if (req.user.rol == "Admin") {
            loginAdmin = true;
        }
        if (req.user.permisoValidador == "1") {
            permisoValidador = true;
        }
    const { buscar } = req.body;

    const inscripciones = await pool.query('SELECT * FROM inscripcion I LEFT JOIN users U ON I.usuario = U.email WHERE I.modalidad = ? AND (I.Usuario LIKE ? OR U.nombres LIKE ? OR U.apellidos LIKE ? OR U.identidad LIKE ?)', ['Virtual', `%${buscar}%`, `%${buscar}%`, `%${buscar}%`, `%${buscar}%`]);
    const formatYmd = date => date.toLocaleDateString('en-GB').slice(0, 10);
    inscripciones.forEach(element => {
        element.created_at = formatYmd(element.created_at)
    });
    res.render('inscripcion/listAdmin', {

        inscripciones,
        loginAdmin,
        permisoValidador,
        buscar
    });


});


router.get('/edit/inscripcion/:usuario',isLoggedIn,permisoValidador, async (req, res) => {
 
        try {
            const { usuario } = req.params;
             const confirmacionEntrada ="Si";
             const estado = 2;

            const confirmacion = {
                confirmacionEntrada,
                estado

            };
            await pool.query('UPDATE inscripcion set ? WHERE usuario = ?', [confirmacion, usuario]);
            req.flash('success', 'Inscripción validada con exito');
            res.redirect('/inscripcion/inscripcionesAdminp');
        } catch (error) {
            req.flash('messageErrores', '¡Ups! Algo salió mal');
            res.redirect('back');
        }
    
});

router.get('/edit/inscripcionvirtual/:usuario',isLoggedIn,permisoValidador, async (req, res) => {
 
    try {
        const { usuario } = req.params;
         const confirmacionEntrada ="Si"; 
         const estado = 2;

        const confirmacion = {
            confirmacionEntrada,
            estado

        };
        await pool.query('UPDATE inscripcion set ? WHERE usuario = ?', [confirmacion, usuario]);
        req.flash('success', 'Inscripción validada con exito');
        res.redirect('/inscripcion/inscripcionesAdminvirtual');
    } catch (error) {
        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});



router.get('/ver/virtual/:usuario', isLoggedIn,permisoValidador, async (req, res) => {


    try {
        var loginAdmin = false;
        var permisoValidador = false;
        rol = req.user.rol;
    
            if (req.user.rol == "Admin") {
                loginAdmin = true;
            }
            if (req.user.permisoValidador == "1") {
                permisoValidador = true;
            }
        const { usuario } = req.params;

        const inscripcion = await pool.query('Select inscripcion.id,users.nombres,users.apellidos,inscripcion.usuario, inscripcion.created_at,inscripcion.modalidad,inscripcion.total, inscripcion.cuotasPago, inscripcion.confirmacionEntrada  from inscripcion ,users WHERE users.email=inscripcion.usuario and inscripcion.usuario =?', [usuario]);
        const inscripcionId = inscripcion[0].id

        const cuotasimagen = await pool.query('Select * from inscripcioncomprobantes where inscripcionId =? ', [inscripcionId]);

        const inscripciondetalle = await pool.query('Select * from inscripciondetalle,congreso where congreso.id=inscripciondetalle.eventoId and  inscripcionId =? ', [inscripcionId]);




        res.render('inscripcion/validarvirtual', {



            inscripcion: inscripcion[0],
            inscripciondetalle,
            cuotasimagen,
            loginAdmin,
            permisoValidador

        });
    } catch (error) {


        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('back');
    }

});
module.exports = router;