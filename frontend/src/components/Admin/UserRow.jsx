import { Badge, TEXT, cx } from "../../ui";

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

const UserRow = ({ user }) => {
  const roleStyle = ROLE_STYLE[user.role] || ROLE_STYLE.user;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <tr className="border-b-3 border-ink last:border-b-0">
      <td className="px-4 py-3 font-semibold">{fullName}</td>
      <td className={cx("px-4 py-3", TEXT.body, "text-ink/80")}>
        {user.email}
      </td>
      <td className="px-4 py-3">
        <Badge tone={roleStyle.tone} size="xs">
          {roleStyle.label}
        </Badge>
      </td>
      <td className={cx("px-4 py-3", TEXT.micro, "text-ink/60")}>
        {formatDate(user.createdAt)}
      </td>
    </tr>
  );
};

export default UserRow;
