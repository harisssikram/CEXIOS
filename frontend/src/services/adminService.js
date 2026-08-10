import api from "./api";

/**
 * Admin endpoints -- require a bearer token, attached automatically by the
 * axios interceptor in ./api.js. Routes are unchanged from the existing backend.
 */
const adminService = {
  login(username, password) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    return api
      .post("/api/v1/admin/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => res.data);
  },

  verifyPin(pin) {
    return api.post("/api/v1/admin/verify-pin", { pin }).then((res) => res.data);
  },

  forceAddProjects(uploader, rows) {
    return api
      .post("/api/v1/admin/projects/force-add", { uploader, rows })
      .then((res) => res.data);
  },

  dashboard() {
    return api.get("/api/v1/admin/dashboard").then((res) => res.data);
  },

  listProjects() {
    return api.get("/api/v1/admin/projects").then((res) => res.data);
  },

  createProject(project) {
    return api.post("/api/v1/admin/projects", project).then((res) => res.data);
  },

  updateProject(id, updates) {
    return api.put(`/api/v1/admin/projects/${id}`, updates).then((res) => res.data);
  },

  deleteProject(id) {
    return api.delete(`/api/v1/admin/projects/${id}`);
  },

  listUploads() {
    return api.get("/api/v1/admin/uploads").then((res) => res.data);
  },

  async exportProjects() {
    const res = await api.get("/api/v1/admin/projects/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects_export.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default adminService;
