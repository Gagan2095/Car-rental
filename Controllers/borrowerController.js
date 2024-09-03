import db from "../Models/index.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import {Op} from 'sequelize'

dotenv.config()

const Borrower = db.Borrower
const Cars = db.AllCars
const Owner = db.Owner
const OwnerCars = db.OwnerCar
const RentalRequest = db.RentalRequest
const BorrowedCar = db.BorrowedCar

// Borrower's login controller
const login = async (req, res) => {
    const {email,password} = req.body
    try {
        const user = await Borrower.findOne({where:{email:email}})
        if(user && await bcrypt.compare(password,user.password)){
            const token = jwt.sign({id:user.id},process.env.SECRETKEY)
            res.cookie('token',token)
            res.status(200).json({success:true,message:"Successfully logged in",token:token})
        } else {
            res.status(400).json({success:false,message:"Invalid Credentials"})
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Borrower's logout controller
const logout = async (req,res) => {
    res
    .clearCookie('token')
    .status(200)
    .json({success:true,message:"Borrower logged out"})
}

// Borrower's signup controller
const signup = async (req, res) => {
    const {name,email,password} = req.body
    if(!email || !name || !password) res.status(400).json({success:false,message:"Invalid parameters"}) 
    else {
        try {
            const user = await Borrower.findOne({where:{[Op.or]:[{email:email}]}})
            if(user){
                res.status(409).json({success:false,message:"Email or bussiness name already exists!"})
            } else {
                const hashPass = await bcrypt.hash(password,8)
                await Borrower.create({
                    name:name,
                    email:email,
                    password: hashPass
                })
                res.status(200).json({success:true,message:"Successfully account created"})
            }
        } catch (error) {
            res.status(500).json({success:false,message:"Internal server error",error:error.message})
        } 
    }
}

//Borrower's controller to see all valid cars
const getAllCars = async (req, res) => {
    try {
        const result = await Cars.findAll({attributes: {exclude: ['id']}})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to search for a car by name
const getCarByName = async (req, res) => {
    try {
        const {name} = req.body
        const result = await Cars.findOne({where:{name:name}})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to see the list of all owners
const OwnersList = async (req,res) => {
    try {
        const result = await Owner.findAll({attributes:{exclude:['password']}})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Borrower's controller to see all the cars of an owner
const OwnerCarsList = async (req,res) => {
    try {
        const {id} = req.body
        const result = await OwnerCars.findAll({where:{owner_id:id}})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to book a car on rent
const bookCar = async (req, res) => {
    try {
        const {id} = req.body
        const singleOwnerCar = await OwnerCars.findOne({where:{id:id}})
        if(!singleOwnerCar) {
            res.status(400).json({success:false,message:"Sorry! this car is not owned by any of the owner"})
            return
        }
        const user_id = JSON.parse(atob(req.cookies.token.split('.')[1]))

        const result = await RentalRequest.create({
            borrower_id: user_id.id,
            id:id,
            status:'pending'
        })
        res.status(200).json({success:true,message:"Successfully request raised",result})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to see all the pending rental request
const showAllRentalRequest = async (req,res) => {
    try {
        const user_id = JSON.parse(atob(req.cookies.token.split('.')[1]))
        const result = await RentalRequest.findAll({where:{borrower_id:user_id.id}})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to cancel a pending rental request
const cancelBooking = async (req, res) => {
    try {
        const {id} = req.body
        await RentalRequest.destroy({where:{id:id}})
        res.status(200).json({success:true,message:"Rental request has been cancelled"})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to show the list of all it's borrowed car
const showBorrowedCar = async (req,res) => {
    try {
        const user_id = JSON.parse(atob(req.cookies.token.split('.')[1]))
        const result = await BorrowedCar.findAll({where:{borrower_id:user_id.id}})
        res.status(200).json({success:true,message:"Successfylly fetch data",result})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

//Borrower's controller to return a borrowed car
const returnCar = async (req, res) => {
    try {
        const {id} = req.body
        const user_id = JSON.parse(atob(req.cookies.token.split('.')[1]))
        await BorrowedCar.destroy({where:{borrower_id:user_id.id,owner_car_id:id}})
        res.status(200).json({success:true,message:"Car returned successfully"})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

export default {
    login,
    logout,
    signup,
    getAllCars,
    getCarByName,
    bookCar,
    cancelBooking,
    returnCar,
    OwnersList,
    OwnerCarsList,
    showAllRentalRequest,
    showBorrowedCar
}