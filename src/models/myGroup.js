const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const IndividualUser = require("./individual-account");
const GroupAccount = require("./group-account");

class MyGroup extends Model {}

MyGroup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "member",
    },
  },
  {
    sequelize,
    modelName: "MyGroup",
    timestamps: true,
  }
);

module.exports = MyGroup;

// Relations for IndividualUser
IndividualUser.belongsToMany(GroupAccount, {
  through: MyGroup,
  foreignKey: "userId",
});
GroupAccount.belongsToMany(IndividualUser, {
  through: MyGroup,
  foreignKey: "groupId",
});

// GroupAccount Relation for Groups
GroupAccount.hasMany(MyGroup, { foreignKey: "groupId" });
MyGroup.belongsTo(GroupAccount, { foreignKey: "groupId" });
