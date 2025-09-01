const HttpStatus = require('../constants/httpStatus');

const checkSessionAdmin = ((req,res,next)=>{
    if(req.session.isAdmin){
        console.log("Admin session Active",req.session.isAdmin);
        return next();
    }else{
        console.log("Access denied: not admin");
        return res.status(HttpStatus.UNAUTHORIZED).redirect('/admin');
    }
})

const isLogginAdmin = ((req,res,next)=>{
    if(req.session.isAdmin){
        console.log("admin logged")
        res.redirect('/dashboard')
    }else{
        next()
    }
})

module.exports = { checkSessionAdmin, isLogginAdmin}
