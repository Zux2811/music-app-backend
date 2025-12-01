import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Folder = sequelize.define("Folder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  UserId: { type: DataTypes.INTEGER, allowNull: false }, // ✅ Foreign key to User
}, {
  tableName: "folders",
  timestamps: true,
});

export default Folder;
