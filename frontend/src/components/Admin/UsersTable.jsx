import { Card, TEXT } from "../../ui";
import UserRow from "./UserRow";

const UsersTable = ({ users, onUserUpdated }) => (
  <Card
    tone="paper"
    shadow="sm"
    shape="irregularAlt"
    padding="none"
    className="overflow-x-auto"
  >
    <table className="w-full min-w-[720px] border-collapse text-left">
      <thead>
        <tr className="border-b-4 border-ink bg-ink text-paper">
          <th className={`px-4 py-3 ${TEXT.label}`}>Nombre completo</th>
          <th className={`px-4 py-3 ${TEXT.label}`}>Correo</th>
          <th className={`px-4 py-3 ${TEXT.label}`}>Rol</th>
          <th className={`px-4 py-3 ${TEXT.label}`}>Estado</th>
          <th className={`px-4 py-3 ${TEXT.label}`}>Registrado</th>
          <th className={`px-4 py-3 ${TEXT.label}`}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} onUserUpdated={onUserUpdated} />
        ))}
      </tbody>
    </table>
  </Card>
);

export default UsersTable;
