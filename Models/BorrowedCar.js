import { Sequelize } from "sequelize";
export default (sequelize) => {
    return sequelize.define("borrowedCar", {
        borrower_id: {
            type: Sequelize.UUID
        },
        owner_car_id: {
            type: Sequelize.UUID
        }
    });
};
