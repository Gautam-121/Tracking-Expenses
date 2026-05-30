import { DataTypes } from 'sequelize';

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable('expense_participants', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    expense_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'expenses',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'participants',
        key: 'id',
      },
    },
    share_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('expense_participants', ['expense_id', 'participant_id'], {
    unique: true,
    name: 'expense_participants_expense_id_participant_id_unique',
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('expense_participants');
};
