const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");
const Connection = sequelize.define(
  "Connection",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "Connection",
  },
  {
    timestamps: true,
  }
);

// Associations

IndividualUser.hasMany(Connection, {
  foreignKey: "senderId",
  constraints: false,
});
IndividualUser.hasMany(Connection, {
  foreignKey: "receiverId",
  constraints: false,
});

GroupAccount.hasMany(Connection, {
  foreignKey: "senderId",
  constraints: false,
});
GroupAccount.hasMany(Connection, {
  foreignKey: "receiverId",
  constraints: false,
});

Connection.belongsTo(IndividualUser, {
  foreignKey: "senderId",
  constraints: false,
  as: "SenderIndividual",
});
Connection.belongsTo(IndividualUser, {
  foreignKey: "receiverId",
  constraints: false,
  as: "ReceiverIndividual",
});
Connection.belongsTo(GroupAccount, {
  foreignKey: "senderId",
  constraints: false,
  as: "SenderGroup",
});
Connection.belongsTo(GroupAccount, {
  foreignKey: "receiverId",
  constraints: false,
  as: "ReceiverGroup",
});

module.exports = Connection;
