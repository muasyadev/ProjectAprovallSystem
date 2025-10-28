import axios from "axios";

const API_URL = "http://localhost:3000/api/lecturer";

// Fetch students for the category assigned to the logged-in lecturer
export const getStudentsByCategory = async () => {
  return await axios.get(`${API_URL}/my-students`, { withCredentials: true });
};
