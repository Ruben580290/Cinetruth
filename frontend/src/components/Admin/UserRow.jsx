import { useState } from "react";

import { Badge, Button, TEXT, cx } from "../../ui";
import {
  updateUserRoleRequest,
  toggleUserStatusRequest,
} from "../../api/usersApi";
import { useAuth } from "../../auth/AuthContext";

const ROLE_STYLE = {
  admin: { tone: "hotpink", label: "👑 Admin" },
  user: { tone: "cyan", label: "🙂 Usuario" },
};

const formatDate = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

const UserRow = ({ user, onUserUpdated }) => {
  const { token, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleStyle = ROLE_STYLE[user.role] || ROLE_STYLE.user;
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const isSelf = currentUser?.id === user.id;

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    setLoading(true);
    setError("");
    try {
      const response = await updateUserRoleRequest(token, user.id, newRole);
      onUserUpdated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toggleUserStatusRequest(
        token,
        user.id,
        !user.isActive,
      );
      onUserUpdated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b-3 border-ink last:border-b-0">
      <td className="px-4 py-3 font-semibold">
        {fullName}
        {isSelf && (
          <span className={cx(TEXT.micro, "ml-2 text-ink/50")}>(tú)</span>
        )}
      </td>
      <td className={cx("px-4 py-3", TEXT.body, "text-ink/80")}>
        {user.email}
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={handleRoleChange}
          disabled={loading}
          className="border-3 border-ink px-2 py-1 font-mono text-xs"
        >
          <option value="user">🙂 Usuario</option>
          <option value="admin">👑 Admin</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <Badge tone={user.isActive ? "lime" : "hotpink"} size="xs">
          {user.isActive ? "Activo" : "Desactivado"}
        </Badge>
      </td>
      <td className={cx("px-4 py-3", TEXT.micro, "text-ink/60")}>
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 py-3">
        <Button
          type="button"
          variant={user.isActive ? "danger" : "success"}
          size="sm"
          onClick={handleToggleStatus}
          disabled={loading || isSelf}
          title={isSelf ? "No puedes desactivar tu propia cuenta" : ""}
        >
          {user.isActive ? "Desactivar" : "Activar"}
        </Button>
        {error && (
          <p className={cx(TEXT.micro, "mt-1 text-hotpink")}>{error}</p>
        )}
      </td>
    </tr>
  );
};

export default UserRow;
