import db from "../Models/index.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import {Op} from 'sequelize'
dotenv.config()

const Owner = db.Owner
const Cars = db.AllCars
const OwnerCar = db.OwnerCar
const RentalRequest = db.RentalRequest
const sequelize = db.sequelize
const BorrowedCar = db.BorrowedCar

// Owner's login controller
const login = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await Owner.findOne({where:{email:email}})
        if(user && await bcrypt.compare(password,user.password)){
            const token = jwt.sign({id:user.id,bussinessName:user.bussinessName},process.env.SECRETKEY);
            res.cookie('token',token);
            res.status(200).json({success:true,message:"Successfully logged in",token:token})
        } else {
            res.status(400).json({success:false,message:"Invalid Credentials"})
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's logout controller
const logout = async (req,res) => {
    res
    .clearCookie('token')
    .status(200)
    .json({success:true,message:"Owner logged out"})
}

// Owner's signup controller
const signup = async (req, res) => {
    const {name,email,password,bussinessName} = req.body
    if(!email || !name || !password || !bussinessName) res.status(400).json({success:true,message:"Invalid parameters"}) 
    else {
        try {
            const user = await Owner.findOne({where:{[Op.or]:[{email:email},{bussinessName:bussinessName}]}})
            if(user){
                res.status(409).json({success:false,message:"Email or bussiness name already exists!"})
            } else {
                const hashPass = await bcrypt.hash(password,8)
                Owner.create({
                    name:name,
                    email:email,
                    password: hashPass,
                    bussinessName:bussinessName
                })
                .then(() => {
                    res.status(200).json({success:true,message:"Successfully account created"})
                })
            }
        } catch (error) {
            res.status(500).json({success:false,message:"Internal server error",error:error.message})
        } 
    }
}

const CarAvailableOnRent = async (req,res) => {
    try {
        const {id} = JSON.parse(atob(req.cookies.token.split('.')[1]));
        const result = await OwnerCar.findAll({where:{owner_id:id}})
        res.status(200).json({success:true,message:"Successfully fetch Cars",result})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to add new cars for rental services
const addCar = async (req, res) => {
    try {
        const {carName,price} = req.body
        const {id} = JSON.parse(atob(req.cookies.token.split('.')[1]));
        const car = await Cars.findOne({where:{name:carName}})
        if(!car) {
            res.status(400).json({success:false,message:"No Car found with the given name"})
        } else {
            const alreadyExist = await OwnerCar.findOne({where:{[Op.and]:[{car_id:car.id},{owner_id:id}]}})
            if(alreadyExist){
                res.status(400).json({success:false,message:"You already added this Car"})
            } else {
                const newCar = await OwnerCar.create({
                    owner_id:id,
                    car_id:car.id,
                    price:price
                })
                res.status(200).json({success:true,message:"Successfully car added",car:newCar})
            }
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to remove new cars for rental services
const removeCar = async (req, res) => {
    try {
        const {id} = JSON.parse(atob(req.cookies.token.split('.')[1]));
        const car = await OwnerCar.findOne({where:{owner_id:id}})
        if(!car){
            res.status(400).json({success:false,message:"Car not found"})
        } else {
            const car_id = await Cars.findOne({where:{name:req.body.name}})
            const car = await OwnerCar.destroy({where:{
                owner_id:id,
                car_id:car_id.id,
            }})
            res.status(200).json({success:true,message:"Successfully car removed",car})
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to update the price of an car for rental services
const updatePrice = async (req, res) => {
    try {
        const {carName,price} = req.body
        const {id} = JSON.parse(atob(req.cookies.token.split('.')[1]));
        const carInfo = await Cars.findOne({where:{name:carName}})
        if(!carInfo) {
            res.status(400).json({success:false,message:"Invalid car name"})
            return
        }
        const car = await OwnerCar.findOne({where:{car_id:carInfo.id,owner_id:id}})
        if(!car) {
            res.status(400).json({success:false,message:"No Car found with the given name"})
        } else {
            await OwnerCar.update({
                price:price
            },{where:{id:car.id}})
            res.status(200).json({success:true,message:"Successfully updated price"})
            }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to view all rental request of the owner
const showAllRentalRequest = async (req,res) => {
    try {
        const {id} = JSON.parse(atob(req.cookies.token.split('.')[1]));
        const [requests] = await sequelize.query(
            `SELECT * FROM "RentalRequests" WHERE id IN (SELECT id FROM "ownerCars" WHERE owner_id = :owner_id AND status = 'pending')`,
            { replacements: { owner_id: id }, type: sequelize.QueryTypes.SELECT }
        );
        if(requests) {
            res.status(200).json({success:true,message:"Sucessfully fetched data",requests})
        } else res.status(200).json({success:false,message:'No request found'})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to accept or reject the pending rental request for an car
const acceptRejectRentalRequest = async (req, res) => {
    try {
        const {id,status} = req.body
        const request = await RentalRequest.findOne({where:{id:id}})
        if(status!=='accept' && status!=='reject') res.status(400).json({success:true,message:"Invalid status"})
        else  {
            if(status==='accept'){
                await BorrowedCar.create({
                    borrower_id:request.borrower_id,
                    owner_car_id:request.id
                })
                await RentalRequest.destroy({where:{id:id}})
            } else {
                await RentalRequest.update({status:'reject'},{where:{id:id}})
            }
            res.status(200).json({success:true,message:`Successfully ${status}ed the request`})
        }
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

// Owner's controller to view all valid cars
const showCars = async (req,res) => {
    try {
        const result = await Cars.findAll({attributes: {exclude: ['id']}})
        res.status(200).json({success:true,result})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error",error:error.message})
    }
}

export default {
    login,
    signup,
    addCar,
    removeCar,
    updatePrice,
    acceptRejectRentalRequest,
    showAllRentalRequest,
    showCars,
    logout,
    CarAvailableOnRent
}