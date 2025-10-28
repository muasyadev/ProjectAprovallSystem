// LecturerDashboard.tsx
import { useState, useEffect } from "react";
import axios from "axios";

interface Student {
  student_name: string;
  student_username: string;
  project_title: string;
  project_category: string;
}

const LecturerDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignedCategory, setAssignedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/lecturer/my-students",
          { withCredentials: true }
        );
        setStudents(res.data.students);
        setAssignedCategory(res.data.category);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p>Loading students...</p>;

  return (
    <div>
      <h2>Students in Category: {assignedCategory}</h2>
      {students.length === 0 ? (
        <p>No students assigned to this category yet.</p>
      ) : (
        <ul>
          {students.map((student) => (
            <li key={student.student_username}>
              {student.student_name} ({student.student_username}) - Project:{" "}
              {student.project_title || "N/A"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LecturerDashboard;
