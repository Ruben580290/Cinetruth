import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  updateUserRoleRequest,
  deactivateUserRequest,
  activateUserRequest,
} from "../../api/usersApi";
import { Badge, Button, TEXT, cx } from "../../ui";

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

const UserRow = ({ user, isSelf, canManage, onUserUpdated }) => {
  const { token } = useAuth();
  const roleStyle = ROLE_STYLE[user.role] || ROLE_STYLE.user;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    if (newRole === user.role) return;

    setBusy(true);
    setError("");
    try {
      const response = await updateUserRoleRequest(token, user.id, newRole);
      onUserUpdated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`¿Desactivar la cuenta de ${fullName}?`)) return;

    setBusy(true);
    setError("");
    try {
      const response = await deactivateUserRequest(token, user.id);
      onUserUpdated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleActivate = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await activateUserRequest(token, user.id);
      onUserUpdated(response.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-b-3 border-ink last:border-b-0">
      <td className="px-4 py-3 font-semibold">{fullName}</td>
      <td className={cx("px-4 py-3", TEXT.body, "text-ink/80")}>
        {user.email}
      </td>
      <td className="px-4 py-3">
        {canManage ? (
          <select
            value={user.role}
            disabled={busy || isSelf}
            onChange={handleRoleChange}
            className="border-3 border-ink px-2 py-1 font-mono text-xs"
          >
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <Badge tone={roleStyle.tone} size="xs">
            {roleStyle.label}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge tone={user.isActive ? "cyan" : "hotpink"} size="xs">
          {user.isActive ? "Activo" : "Desactivado"}
        </Badge>
      </td>
      <td className={cx("px-4 py-3", TEXT.micro, "text-ink/60")}>
        {formatDate(user.createdAt)}
      </td>
      <td className="px-4 py-3">
        {canManage && user.isActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || isSelf}
            title={isSelf ? "No puedes desactivar tu propia cuenta" : undefined}
            onClick={handleDeactivate}
          >
            Desactivar
          </Button>
        )}
        {canManage && !user.isActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy || isSelf}
            title={isSelf ? "No puedes cambiar tu propia cuenta" : undefined}
            onClick={handleActivate}
          >
            Activar
          </Button>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
};

export default UserRow;
