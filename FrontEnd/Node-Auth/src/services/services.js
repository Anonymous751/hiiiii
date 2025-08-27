import api from "../utils/axios";

export const registerApi = async (body) => {
  return await api.post("/users/register", body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};