import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'groups',  // foreign key pointing to groups table
      key: 'id',
    },
    onDelete: 'CASCADE', // if group deleted, participants also deleted
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Participant name cannot be empty' },
      len: { args: [1, 255], msg: 'Participant name must be between 1 and 255 characters' },
    },
  },
}, {
  tableName: 'participants',
  timestamps: true,
  indexes: [
    {
      // same name cannot exist twice in same group
      unique: true,
      fields: ['groupId', 'name'],
    },
  ],
});

export default Participant;