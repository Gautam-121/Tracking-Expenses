import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ExpenseParticipant = sequelize.define('ExpenseParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  expenseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'expenses',
      key: 'id',
    },
    onDelete: 'CASCADE', // if expense deleted, shares also deleted
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'participants',
      key: 'id',
    },
  },
  shareAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'Share amount must be greater than 0',
      },
    },
  },
}, {
  tableName: 'expense_participants',
  timestamps: true,
  indexes: [
    {
      // one participant cannot appear twice in same expense
      unique: true,
      fields: ['expenseId', 'participantId'],
    },
  ],
});

export default ExpenseParticipant;