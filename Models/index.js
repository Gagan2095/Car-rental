import { Sequelize } from "sequelize"
import BorrowerModel from './borrowerModel.js'
import OwnerModel from './ownerModel.js'
import OwnerCarModel from './OwnerCarModel.js'
import AllCarsModel from './allCarsModel.js'
import RentalRequestModel from "./RentalRequestModel.js"
import BorrowedCarModel from './BorrowedCar.js'
import dotenv from 'dotenv'
dotenv.config()
const sequelize = new Sequelize(process.env.DATABASE,process.env.USERNAME,process.env.PASSWORD, {
    host:process.env.HOST,
    dialect:'postgres',
    logging:false,
    operatorsAliases:'0',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const db = {}
db.sequelize = sequelize
db.Borrower = BorrowerModel(sequelize)
db.Owner = OwnerModel(sequelize)
db.OwnerCar = OwnerCarModel(sequelize)
db.AllCars = AllCarsModel(sequelize)
db.RentalRequest = RentalRequestModel(sequelize)
db.BorrowedCar = BorrowedCarModel(sequelize)

export default db