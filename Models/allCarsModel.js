import { Sequelize } from "sequelize";
export default (sequelize) => {
    return sequelize.define("allCars", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        name: {
            type: Sequelize.DataTypes.STRING
        },
        company: {
            type: Sequelize.DataTypes.STRING
        },
        model: {
            type: Sequelize.DataTypes.STRING
        }
    });
};
