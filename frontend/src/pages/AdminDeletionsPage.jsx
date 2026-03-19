import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AdminDeletionsPage = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [usersOverview, setUsersOverview] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState("");
  const [activeCategory, setActiveCategory] = useState("overview");
  const [categoryErrors, setCategoryErrors] = useState({
    overview: "",
    users: "",
    deletedTasks: "",
    deletedUsers: "",
  });

  const formatSeconds = (value) => {
    const total = Math.max(0, Number(value) || 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setCategoryErrors({
        overview: "",
        users: "",
        deletedTasks: "",
        deletedUsers: "",
      });

      const [deletionsRes, usersRes] = await Promise.allSettled([
        axios.get("/admin/deletions"),
        axios.get("/admin/users-overview"),
      ]);

      let hadAnySuccess = false;

      if (deletionsRes.status === "fulfilled") {
        hadAnySuccess = true;
        setDeletedTasks(deletionsRes.value.data?.deletedTasks || []);
        setDeletedUsers(deletionsRes.value.data?.deletedUsers || []);
      } else {
        setDeletedTasks([]);
        setDeletedUsers([]);
        const msg =
          deletionsRes.reason?.response?.data?.msg ||
          "Failed to load deleted records";
        setCategoryErrors((prev) => ({
          ...prev,
          deletedTasks: msg,
          deletedUsers: msg,
        }));
      }

      if (usersRes.status === "fulfilled") {
        hadAnySuccess = true;
        setUsersOverview(usersRes.value.data?.usersOverview || []);
      } else {
        setUsersOverview([]);
        const msg =
          usersRes.reason?.response?.data?.msg || "Failed to load users overview";
        setCategoryErrors((prev) => ({
          ...prev,
          overview: msg,
          users: msg,
        }));
      }

      if (!hadAnySuccess) {
        setError("Failed to load admin data. Check server logs.");
      }
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to load deleted data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    else setLoading(false);
  }, [user]);

  const summary = useMemo(() => {
    const totalUsers = usersOverview.length;
    const activeUsers = usersOverview.filter((x) => !x.user?.isDeleted).length;
    const totalTasksAdded = usersOverview.reduce(
      (acc, x) => acc + (x.stats?.tasksAdded || 0),
      0
    );
    const activeTasks = usersOverview.reduce(
      (acc, x) => acc + (x.stats?.activeTasks || 0),
      0
    );
    const totalReadingSeconds = usersOverview.reduce(
      (acc, x) => acc + (x.stats?.totalReadingSeconds || 0),
      0
    );
    return {
      totalUsers,
      activeUsers,
      deletedUsers: deletedUsers.length,
      totalTasksAdded,
      activeTasks,
      deletedTasks: deletedTasks.length,
      totalReadingSeconds,
    };
  }, [usersOverview, deletedUsers, deletedTasks]);

  const showOverview = activeCategory === "overview";
  const showUsers = activeCategory === "users";
  const showDeletedTasks = activeCategory === "deletedTasks";
  const showDeletedUsers = activeCategory === "deletedUsers";

  if (!user?.isAdmin) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Access Required</h2>
        <p>This page is visible only to the configured admin account.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 20 }}>
      <div>
        <h1 style={{ margin: "0 0 6px" }}>Admin Activity Categories</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Every activity is displayed category-wise.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "users", label: "Users Full Audit" },
          { key: "deletedTasks", label: "Deleted Tasks" },
          { key: "deletedUsers", label: "Deleted Accounts" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveCategory(item.key)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: activeCategory === item.key ? "#0f172a" : "#fff",
              color: activeCategory === item.key ? "#fff" : "#0f172a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#0f172a",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <div>Loading deleted data...</div>}
      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

      {!loading && !error && (
        <>
          {showOverview && (
            <section
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                <strong>Overview</strong>
              </div>
              {categoryErrors.overview && (
                <div style={{ padding: 12, color: "#b91c1c" }}>
                  {categoryErrors.overview}
                </div>
              )}
              <div
                style={{
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                }}
              >
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Total Users</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.totalUsers}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Active: {summary.activeUsers} | Deleted: {summary.deletedUsers}
                  </div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Tasks</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.totalTasksAdded}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Active: {summary.activeTasks} | Deleted: {summary.deletedTasks}
                  </div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Reading Time</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    {formatSeconds(summary.totalReadingSeconds)}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Across all users</div>
                </div>
              </div>
            </section>
          )}

          {showUsers && (
            <section style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
              <strong>Users Full Audit ({usersOverview.length})</strong>
            </div>
            {categoryErrors.users && (
              <div style={{ padding: 12, color: "#b91c1c" }}>
                {categoryErrors.users}
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: 10 }}>User</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Account</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Tasks</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Journal</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Reading</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Bookmarks</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Contests</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Timetable</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Streak Days</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {usersOverview.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: 12 }}>
                        No users found.
                      </td>
                    </tr>
                  )}

                  {usersOverview.map((x) => {
                    const uid = x.user?._id;
                    const isExpanded = expandedUserId === String(uid || "");
                    return (
                      <React.Fragment key={uid}>
                        <tr style={{ borderTop: "1px solid #e2e8f0" }}>
                          <td style={{ padding: 10 }}>
                            <div style={{ fontWeight: 600 }}>{x.user?.name || "-"}</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>{x.user?.email || "-"}</div>
                          </td>
                          <td style={{ padding: 10 }}>
                            <div>{x.user?.isDeleted ? "Deleted" : "Active"}</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              Created: {fmtDate(x.user?.createdAt)}
                            </div>
                          </td>
                          <td style={{ padding: 10 }}>
                            <div>Added: {x.stats?.tasksAdded || 0}</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              Active {x.stats?.activeTasks || 0} / Deleted {x.stats?.deletedTasks || 0}
                            </div>
                          </td>
                          <td style={{ padding: 10 }}>{x.stats?.journals || 0}</td>
                          <td style={{ padding: 10 }}>
                            <div>{x.stats?.readingSessions || 0} sessions</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              {formatSeconds(x.stats?.totalReadingSeconds)}
                            </div>
                          </td>
                          <td style={{ padding: 10 }}>{x.stats?.bookmarks || 0}</td>
                          <td style={{ padding: 10 }}>{x.stats?.contests || 0}</td>
                          <td style={{ padding: 10 }}>{x.stats?.timetableEntries || 0}</td>
                          <td style={{ padding: 10 }}>{x.stats?.activeStreakDays || 0}</td>
                          <td style={{ padding: 10 }}>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedUserId(isExpanded ? "" : String(uid || ""))
                              }
                              style={{
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 10px",
                                background: "#0f172a",
                                color: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={10} style={{ padding: 12, background: "#f8fafc" }}>
                              <div style={{ display: "grid", gap: 12 }}>
                                <div style={{ display: "grid", gap: 8 }}>
                                  <strong>Profile / Preferences</strong>
                                  <pre
                                    style={{
                                      margin: 0,
                                      padding: 10,
                                      borderRadius: 8,
                                      background: "#fff",
                                      border: "1px solid #e2e8f0",
                                      overflowX: "auto",
                                      fontSize: 12,
                                    }}
                                  >
                                    {JSON.stringify(
                                      {
                                        user: x.user,
                                        links: x.links,
                                        cpConfig: x.cpConfig,
                                      },
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>

                                <div style={{ display: "grid", gap: 8 }}>
                                  <strong>Added Tasks (Active)</strong>
                                  <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                                      <thead>
                                        <tr style={{ background: "#fff" }}>
                                          <th style={{ textAlign: "left", padding: 8 }}>Title</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Priority</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Due</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Created</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(x.tasks?.active || []).length === 0 && (
                                          <tr>
                                            <td colSpan={5} style={{ padding: 8 }}>
                                              No active tasks.
                                            </td>
                                          </tr>
                                        )}
                                        {(x.tasks?.active || []).map((t) => (
                                          <tr key={t._id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={{ padding: 8 }}>{t.title || "Untitled"}</td>
                                            <td style={{ padding: 8 }}>{t.priority || "-"}</td>
                                            <td style={{ padding: 8 }}>{t.status || "-"}</td>
                                            <td style={{ padding: 8 }}>{fmtDate(t.dueDate)}</td>
                                            <td style={{ padding: 8 }}>{fmtDate(t.createdAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div style={{ display: "grid", gap: 8 }}>
                                  <strong>Deleted Tasks</strong>
                                  <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                                      <thead>
                                        <tr style={{ background: "#fff" }}>
                                          <th style={{ textAlign: "left", padding: 8 }}>Title</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Priority</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Deleted At</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Deleted By</th>
                                          <th style={{ textAlign: "left", padding: 8 }}>Created</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(x.tasks?.deleted || []).length === 0 && (
                                          <tr>
                                            <td colSpan={5} style={{ padding: 8 }}>
                                              No deleted tasks.
                                            </td>
                                          </tr>
                                        )}
                                        {(x.tasks?.deleted || []).map((t) => (
                                          <tr key={t._id} style={{ borderTop: "1px solid #e2e8f0" }}>
                                            <td style={{ padding: 8 }}>{t.title || "Untitled"}</td>
                                            <td style={{ padding: 8 }}>{t.priority || "-"}</td>
                                            <td style={{ padding: 8 }}>{fmtDate(t.deletedAt)}</td>
                                            <td style={{ padding: 8 }}>
                                              {t.deletedBy?.name || "Unknown"}
                                              <div style={{ fontSize: 12, opacity: 0.75 }}>
                                                {t.deletedBy?.email || "-"}
                                              </div>
                                            </td>
                                            <td style={{ padding: 8 }}>{fmtDate(t.createdAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {showDeletedTasks && (
            <section style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
              <strong>Deleted Tasks ({deletedTasks.length})</strong>
            </div>
            {categoryErrors.deletedTasks && (
              <div style={{ padding: 12, color: "#b91c1c" }}>
                {categoryErrors.deletedTasks}
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: 10 }}>Task</th>
                    <th style={{ textAlign: "left", padding: 10 }}>User</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Status</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Due</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Deleted At</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Deleted By</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12 }}>
                        No deleted tasks found.
                      </td>
                    </tr>
                  )}
                  {deletedTasks.map((t) => (
                    <tr key={t._id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 10 }}>
                        <div style={{ fontWeight: 600 }}>{t.title || "Untitled"}</div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>{t.priority || "-"}</div>
                      </td>
                      <td style={{ padding: 10 }}>
                        <div>{t.user?.name || "Unknown"}</div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>{t.user?.email || "Unknown"}</div>
                      </td>
                      <td style={{ padding: 10 }}>{t.status || "-"}</td>
                      <td style={{ padding: 10 }}>{fmtDate(t.dueDate)}</td>
                      <td style={{ padding: 10 }}>{fmtDate(t.deletedAt)}</td>
                      <td style={{ padding: 10 }}>
                        <div>{t.deletedBy?.name || "Unknown"}</div>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>{t.deletedBy?.email || "Unknown"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {showDeletedUsers && (
            <section style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
              <strong>Deleted Accounts ({deletedUsers.length})</strong>
            </div>
            {categoryErrors.deletedUsers && (
              <div style={{ padding: 12, color: "#b91c1c" }}>
                {categoryErrors.deletedUsers}
              </div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: 10 }}>Name</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Email</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Created</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Deleted At</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 12 }}>
                        No deleted accounts found.
                      </td>
                    </tr>
                  )}
                  {deletedUsers.map((u) => (
                    <tr key={u._id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 10 }}>{u.name || "-"}</td>
                      <td style={{ padding: 10 }}>{u.email || "-"}</td>
                      <td style={{ padding: 10 }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ padding: 10 }}>{fmtDate(u.deletedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDeletionsPage;
