module.exports = 
{
    roles(req, res, next) {
        const rol = req.user.rol
        if(rol==='Admin'){
         return next();
        }
        return res.redirect('/');
        },
    permisoAdmin(req, res, next) {
        const permisoAdmin = req.user.permisoAdmin;
        if(permisoAdmin === 1){
         return next();
        }
        return res.redirect('/');
        },
    permisoGeneral(req, res, next) {
        const permisoGeneral = req.user.permisoGeneral;
        if(permisoGeneral === 1){
         return next();
        }
        return res.redirect('/');
        },
    permisoValidador(req, res, next) {
        const permisoValidador = req.user.permisoValidador;
        if(permisoValidador === 1){
            return next();
        }
        return res.redirect('/');
        },
        permisoReportes(req, res, next) {
            const permisoReportes = req.user.permisoReportes;
            if(permisoReportes === 1){
                return next();
            }
            return res.redirect('/');
            }
}
