import sequelize from '../config/database.js';
import Group from './Group.js';
import Participant from './Participant.js';
import Expense from './Expense.js';
import ExpenseParticipant from './ExpenseParticipant.js';

// Group → Participants
Group.hasMany(Participant, { foreignKey: 'groupId', as: 'participants' });
Participant.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Group → Expenses
Group.hasMany(Expense, { foreignKey: 'groupId', as: 'expenses' });
Expense.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Participant → Expenses (who paid)
Participant.hasMany(Expense, { foreignKey: 'paidBy', as: 'paidExpenses' });
Expense.belongsTo(Participant, { foreignKey: 'paidBy', as: 'payer' });

// Expense → ExpenseParticipants
Expense.hasMany(ExpenseParticipant, { foreignKey: 'expenseId', as: 'shares' });
ExpenseParticipant.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

// Participant → ExpenseParticipants
Participant.hasMany(ExpenseParticipant, { foreignKey: 'participantId', as: 'expenseShares' });
ExpenseParticipant.belongsTo(Participant, { foreignKey: 'participantId', as: 'participant' });


const db = {
    sequelize,
    Group,
    Participant,
    Expense,
    ExpenseParticipant,
};

export default db;
