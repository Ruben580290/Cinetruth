import { EntitySchema } from 'typeorm';

const UserSchema = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
      nullable: false,
    },
    firstName: {
      type: 'varchar',
      length: 40,
      nullable: false,
    },
    lastName: {
      type: 'varchar',
      length: 40,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 200,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
      comment: 'Hash de bcrypt, nunca la contraseña en texto plano',
    },
    role: {
      type: 'varchar',
      length: 20,
      default: 'user',
      nullable: false,
      comment: "'user' o 'admin' (CHECK definido en table_creation.sql)",
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
});

export default UserSchema;
