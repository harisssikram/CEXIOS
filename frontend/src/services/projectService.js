import api from "./api";

/**
 * Public endpoints -- no auth required.
 * These map 1:1 to the existing backend; nothing here changes routes,
 * methods, or payload shapes.
 */
const projectService = {
  search(query) {
    return api.get("/api/v1/search", { params: { q: query } }).then((res) => res.data);
  },

  recent() {
    return api.get("/api/v1/recent").then((res) => res.data);
  },

  upload(uploaderName, file, onProgress) {
    const form = new FormData();
    form.append("name", uploaderName);
    form.append("file", file);
    return api
      .post("/api/v1/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      })
      .then((res) => res.data);
  },

  instantAdd(uploaderName, rows) {
    return api
      .post("/api/v1/instant-add", { uploader: uploaderName, rows })
      .then((res) => res.data);
  },
};

export default projectService;
