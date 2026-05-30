import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Group = sequelize.define('Group', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Group name cannot be empty' },
            len: { args: [1, 255], msg: 'Group name must be between 1 and 255 characters' },
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // no two groups can have same code
        validate: {
            notEmpty: { msg: 'Group code cannot be empty' },
            len: { args: [4, 20], msg: 'Group code must be between 4 and 20 characters' },
            is: { args: /^[A-Z0-9]+$/, msg: 'Group code must be uppercase alphanumeric' },
        }
    }
}, {
    timestamps: true, // // adds createdAt and updatedAt automatically
    tableName: 'groups',
})

export default Group;
