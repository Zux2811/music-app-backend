import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Optional for social/external-provider accounts (e.g., Google)
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nullable for social-login users; required only for local accounts'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user"
  }
}, {
  tableName: "users"
});

export default User;
