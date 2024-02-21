const express = require('express');
const router = express();
const request = require('request');
const crypto = require('crypto')

router.get('/', async (req, res) => {
  
    try {

        Date.prototype.yyyymmdd = function () {
            var mm = (this.getMonth() + 1).toString(); 
            var dd = this.getDate().toString();

            return [this.getFullYear(), mm.length === 2 ? '' : '0', mm, dd.length === 2 ? '' : '0', dd].join(''); // padding
        };
        var date = new Date();
        var Fecha = date.yyyymmdd();

        const usuarioid = req.user.id;
        const user ='5';
        //const FechaVieja = "20231025";
        const Clave = "C0M3N4C"

        var Cadena = usuarioid+Fecha+Clave;
        const hash = crypto.createHash('sha1').update(Cadena).digest('hex')


        // axios.get('https://even2.app/comenac2023/login.php', {
        //     params: {
        //         CMNC_UserID: usuarioid,
        //         CMNC_Token: hash
        //     }
        // })
        // .then((response) => {
         
        //     res.redirect('https://even2.app/comenac2023/login.php');
        // })
        // .catch((error) => {
        //     console.error(error);
        //     res.status(500).send('Internal Server Error');
        // });
        
        res.redirect(`https://eventu.app/comenac2023/login.php?CMNC_UserID=`+usuarioid+`&CMNC_Token=`+hash);
    } catch (error) {

        req.flash('messageErrores', '¡Ups! Algo salió mal');
        res.redirect('/');
    }

});







module.exports = router;