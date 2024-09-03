import { Sequelize } from "sequelize";
export default (sequelize) => {
    return sequelize.define("RentalRequest", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        borrower_id: {
            type: Sequelize.UUID
        },
        status: {
            type:Sequelize.DataTypes.STRING
        }
    });
};
