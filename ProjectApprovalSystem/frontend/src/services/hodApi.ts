import axios from "axios";

const API_URL = "http://localhost:3000/api/hod"; //
// Base URL for HOD-related API endpoints

export const assignLecturer = async (
  name: string,
  email: string,
  projectCategory: string
) => {
  return await axios.post(`${API_URL}/assign-lecturer`, {
    name,
    email,
    projectCategory,
  });
};
