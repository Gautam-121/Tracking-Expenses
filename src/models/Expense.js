import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Expense title cannot be empty' },
      len: { args: [1, 255], msg: 'Expense title must be between 1 and 255 characters' },
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2), // supports up to 99999999.99
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Amount must be greater than 0',
      },
    },
  },
  paidBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'participants', // foreign key pointing to participants table
      key: 'id',
    },
  },
  splitType: {
    type: DataTypes.ENUM('equal', 'unequal'),
    allowNull: false,
    defaultValue: 'equal',
  },
}, {
  tableName: 'expenses',
  timestamps: true,
});

export default Expense;