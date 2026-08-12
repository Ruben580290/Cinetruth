import AppDataSource from "../config/database.js";

export const runWithAuditUser = async (authUser, work) => {
  return AppDataSource.transaction(async (manager) => {
    const userId = authUser?.sub ?? null;
    const userEmail = authUser?.email ?? null;

    await manager.query("SELECT set_audit_user($1, $2)", [
      userId,
      userEmail,
    ]);

    return work(manager);
  });
};

export default runWithAuditUser;
