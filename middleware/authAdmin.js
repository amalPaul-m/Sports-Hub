const checkSessionAdmin = ((req,res,next)=>{
    if(req.session.isAdmin){
        console.log("hello guys:"+req.session.isAdmin)
        next()
    }else{
        next()
    }
})

const isLogginAdmin = ((req,res,next)=>{
    if(req.session.isAdmin){
        console.log("AMAL PAUL")
        res.redirect('/dashboard')
    }else{
        next()
    }
})

module.exports = { checkSessionAdmin, isLogginAdmin}
