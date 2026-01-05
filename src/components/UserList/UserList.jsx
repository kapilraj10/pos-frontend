import React, { useState } from "react";
import { toast } from "react-toastify";
import { deleteUser } from "../../Service/UserService";
import './UserList.css';

const UserList = ({ users = [], setUsers }) => {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter(u =>
    `${u.name || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const av = String(a[sortField] ?? '').toLowerCase();
    const bv = String(b[sortField] ?? '').toLowerCase();
    if (av < bv) return sortDirection === 'asc' ? -1 : 1;
    if (av > bv) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // reset page if filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const handleDelete = async (id, userRole) => {
    // Prevent deletion of admin users
    if (userRole === "ROLE_ADMIN") {
      toast.warning("Admin users cannot be deleted");
      return;
    }

    try {
      setLoadingId(id);
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.userId !== id));
      toast.success("User deleted successfully");
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Cannot delete admin user");
      } else {
        toast.error("Failed to delete user");
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Use container-fluid so table can expand full width (avoids inner max-width constraint) */}
      <div className="container-fluid px-3">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 px-3">
          <div>
            <h5 className="fw-bold mb-1">Users</h5>
            <small className="text-muted">{users.length} registered users</small>
          </div>

          <div className="input-group" style={{ maxWidth: "280px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4 px-3">
          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{users.length}</h3>
                    <small className="text-muted">Total Users</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <i className="bi bi-people text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">
                      {users.filter(u => u.role === "ROLE_ADMIN").length}
                    </h3>
                    <small className="text-muted">Admins</small>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded p-2">
                    <i className="bi bi-shield-check text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">
                      {users.filter(u => u.role !== "ROLE_ADMIN").length}
                    </h3>
                    <small className="text-muted">Regular Users</small>
                  </div>
                  <div className="bg-secondary bg-opacity-10 rounded p-2">
                    <i className="bi bi-person text-secondary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card userlist-card">
          <div className="card-body p-0">
            <div className="userlist-table-wrapper">
              <table className="table table-hover align-middle mb-0 userlist-table w-100" style={{ width: '100%' }}>
                <thead className="table-header">
                  <tr>
                    <th className="ps-4" style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                      User {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('email')}>
                      Email {sortField === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('role')}>
                      Role {sortField === 'role' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="py-4">
                          <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
                          <p className="text-muted mt-3 mb-0">
                            {search ? "No matching users found" : "No users available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {pagedUsers.map(user => (
                    <tr key={user.userId}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle avatar-lg" style={{ backgroundColor: user.role === "ROLE_ADMIN" ? "#343a40" : "#6c757d" }}>
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="user-meta">
                            <div className="user-name">{user.name || "Unnamed User"}</div>
                            <small className="text-muted id-meta">ID: {String(user.userId ?? '').substring(0, 8)}{user.userId ? '...' : ''}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="user-email text-truncate">{user.email}</div>
                      </td>

                      <td>
                        <span className={`role-badge ${user.role === "ROLE_ADMIN" ? 'admin' : 'user'}`}>
                          {user.role === "ROLE_ADMIN" ? "Admin" : "User"}
                        </span>
                      </td>

                      <td className="text-end pe-4">
                        {user.role !== "ROLE_ADMIN" && (
                          <button
                            className="btn btn-sm btn-outline-danger delete-btn"
                            onClick={() => handleDelete(user.userId, user.role)}
                            disabled={loadingId === user.userId}
                            title="Delete user"
                            aria-label={`Delete ${user.name || 'user'}`}
                          >
                            {loadingId === user.userId ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Deleting
                              </>
                            ) : (
                              <>
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list (visible on small screens) */}
            <div className="user-cards mt-3">
              {pagedUsers.map((user, idx) => (
                <div className="user-card" key={user.userId ?? idx}>
                  <div className="left">
                    <div
                      className="avatar-circle"
                      style={{ backgroundColor: user.role === "ROLE_ADMIN" ? '#495057' : '#6c757d' }}
                    >
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="fw-medium">{user.name || 'Unnamed User'}</div>
                      <div className="meta">{user.email || '—'}</div>
                    </div>
                  </div>
                  <div className="right d-flex align-items-center gap-2">
                    <span className={`role-badge ${user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</span>
                    {user.role !== "ROLE_ADMIN" && (
                      <button
                        className="btn btn-sm btn-outline-danger action-btn"
                        onClick={() => handleDelete(user.userId, user.role)}
                        disabled={loadingId === user.userId}
                        title="Delete user"
                      >
                        {loadingId === user.userId ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Results Count */}
            {filteredUsers.length > 0 && (
              <div className="card-footer bg-white border-top py-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                      Showing {(currentPage - 1) * pageSize + 1}–{(currentPage - 1) * pageSize + pagedUsers.length} of {filteredUsers.length}
                    </small>
                    <select className="form-select form-select-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: 110 }}>
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>

                  <div className="pagination-controls d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page">‹</button>
                    <div className="page-indicator">Page {currentPage} / {totalPages}</div>
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page">›</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;