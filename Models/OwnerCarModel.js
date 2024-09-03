import { Sequelize } from "sequelize";
export default (sequelize) => {
    return sequelize.define("ownerCar", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        car_id: {
            type: Sequelize.UUID
        },
        owner_id: {
            type: Sequelize.UUID
        },
        price: {
            type:Sequelize.DataTypes.INTEGER
        },
        isOnRent: {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue:false
        }
    });
};
