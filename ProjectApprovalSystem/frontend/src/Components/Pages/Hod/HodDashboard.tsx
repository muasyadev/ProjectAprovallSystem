import React, { useState } from "react";
import { assignLecturer } from "../../../services/hodApi";
import "./hod.css";

const AssignLecturer: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectCategory, setProjectCategory] = useState("");

  // Example categories (you can later fetch these from your backend)
  const projectCategories = [
    "Machine Learning & Data Science",
    "Web & Mobile Development",
    "Cybersecurity & Networking",
    "IoT Project",
  ];

  // ✅ Assign (or Add) a lecturer
  const handleAssign = async () => {
    if (!name || !email || !projectCategory) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    try {
      await assignLecturer(name, email, projectCategory);
      alert(
        `✅ Lecturer ${name} has been added to ${projectCategory} category!`
      );

      // Reset inputs
      setName("");
      setEmail("");
      setProjectCategory("");
    } catch (err) {
      console.error("❌ Failed to assign lecturer:", err);
      alert("Failed to add lecturer. Please try again.");
    }
  };

  return (
    <div className="assign-container">
      <h1 className="assign-title">HOD: Assign (Add) Lecturers</h1>

      <div className="assign-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lecturer Name"
          className="assign-input"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Lecturer Email"
          className="assign-input"
        />

        <select
          value={projectCategory}
          onChange={(e) => setProjectCategory(e.target.value)}
          className="assign-input"
        >
          <option value="">-- Select Project Category --</option>
          {projectCategories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>

        <button onClick={handleAssign} className="assign-button">
          ➕ Add Lecturer
        </button>
      </div>
    </div>
  );
};

export default AssignLecturer;
