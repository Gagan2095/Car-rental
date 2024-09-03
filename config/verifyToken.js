import jwt from 'jsonwebtoken'
export default (req,res,next) => {
    const token = req.cookies.token
    jwt.verify(token,process.env.SECRETKEY,(error) =>{
        if(error) res.status(401).json({message:"Please Login first"})
        else next()
    })
}