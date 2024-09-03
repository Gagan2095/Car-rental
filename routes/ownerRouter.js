import express from 'express'
import Controller from '../Controllers/ownerController.js'
import verifyToken from '../config/verifyToken.js'
const router = express.Router()

router.post('/login',Controller.login)
router.post('/signup',Controller.signup)

// middleware to validate Owner
router.use(verifyToken)
router.use((req,res,next) => {
    const payload = JSON.parse(atob(req.cookies.token.split('.')[1]))
    if(!Object.prototype.hasOwnProperty.call(payload, 'bussinessName')){
        res.status(400).json({message:"Please login as owner"})
    } else next()
})

router.get('/logout',Controller.logout)
router.post('/addCar',Controller.addCar)
router.post('/removeCar',Controller.removeCar)
router.patch('/updatePrice',Controller.updatePrice)
router.post('/rentalRequest',Controller.acceptRejectRentalRequest)
// router.post('/addCars',Controller.addCars)
router.get('/getAllCars',Controller.showCars)
router.get('/showAllRentalRequest',Controller.showAllRentalRequest)
router.get('/showAvailableCarsOnRent',Controller.CarAvailableOnRent)
export default router