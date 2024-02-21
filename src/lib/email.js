const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.comenac2023.com',
    port: 465,
    secure: true,
    auth: {
        user: 'inscripciones@comenac2023.com',
        pass: 'Comenac1234'
    },
    from: 'inscripciones@comenac2023.com',
});

// transporter.sendMail({
//     from: 'COMENAC 2023 <inscripciones@comenac2023.com>',
//     to: 'diego232.lopez@gmail.com',
//     subject: '¡Tu inscripción ha sido registrada!',
//     html: '<h1>Tu inscripción al Congreso Médico Nacional ha sido registrada con éxito.</h1><br> <h2>Adjunto encontrarás el código QR único de tu inscripción, recuerda que también puedes ver el código en la sección de Mi Perfil iniciando sesión en el sitio web.</h2>'}, function(error, info){
//         if(error){
//             console.log(error);
//         }
//         else{
//             console.log('Correo enviado: ' + info.response);
//         }
//     });

module.exports = transporter;
