import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Folder = sequelize.define("Folder", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Folder;
