import express from 'express'
import Controller from '../Controllers/borrowerController.js'
import verifyToken from '../config/verifyToken.js'
const router = express.Router()

router.post('/login',Controller.login)
router.post('/signup',Controller.signup)

//middleware to validate borrower
router.use(verifyToken)
router.get('/getAllCars',Controller.getAllCars)
router.get('/logout',Controller.logout)
router.post('/getCarByName',Controller.getCarByName)
router.post('/bookCar',Controller.bookCar)
router.post('/cancelBooking',Controller.cancelBooking)
router.post('/returnCar',Controller.returnCar)
router.get('/getOwnerList',Controller.OwnersList)
router.post('/getOwnerCar',Controller.OwnerCarsList)
router.get('/showAllRentalRequest',Controller.showAllRentalRequest)
router.get('/showBorrowedCar',Controller.showBorrowedCar)
export default router