import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://ai-knowledge-inbox-bqhq.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});