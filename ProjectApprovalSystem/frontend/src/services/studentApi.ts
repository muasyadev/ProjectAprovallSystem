import axios from "axios";

const API_URL = "http://localhost:3000/api/student";

// ✅ Get logged-in student data
export const getStudentData = async () => {
  return await axios.get(`${API_URL}/me`, { withCredentials: true });
};

// ✅ Enroll in a project
export const enrollProject = async (projectData: {
  projectTitle: string;
  projectCategory: string;
}) => {
  return await axios.post(`${API_URL}/enroll`, projectData, {
    withCredentials: true,
  });
};

// ✅ Submit a project proposal (with file upload)
export const submitProposal = async (data: FormData) => {
  return await axios.post(`${API_URL}/submit-proposal`, data, {
    withCredentials: true,
  });
};

// ✅ Upload documentation (reports, code, etc.)
export const uploadDocumentation = async (data: FormData) => {
  return await axios.post(`${API_URL}/submit-documentation`, data, {
    withCredentials: true,
  });
};

// ✅ Fetch progress for the logged-in student
export const fetchProgress = async () => {
  return await axios.get(`${API_URL}/progress`, { withCredentials: true });
};
