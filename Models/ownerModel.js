import { Sequelize } from "sequelize";
export default (sequelize) => {
    return sequelize.define("owner", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        name: {
            type: Sequelize.DataTypes.STRING
        },
        email: {
            type: Sequelize.DataTypes.STRING
        },
        password: {
            type: Sequelize.DataTypes.STRING
        },
        bussinessName: {
            type: Sequelize.DataTypes.STRING
        }
    });
};
