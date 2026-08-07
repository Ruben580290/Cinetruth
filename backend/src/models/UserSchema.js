import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",

  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },

    firstName: {
      name: "firstName",
      type: String,
      length: 40,
    },

    lastName: {
      name: "lastName",
      type: String,
      length: 40,
    },

    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
    },

    role: {
      type: "enum",
      enum: ["user", "admin"],
      default: "user",
    },

    createdAt: {
      name: "createdAt",
      type: "timestamp",
      createDate: true,
    },

    updatedAt: {
      name: "updatedAt",
      type: "timestamp",
      updateDate: true,
    },
  },
});

export default UserSchema;

