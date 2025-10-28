import { useState, useEffect } from "react";
import {
  getStudentData,
  enrollProject,
  submitProposal,
  uploadDocumentation,
} from "../../../services/studentApi";
import "./studentCss.css";

interface Project {
  id: number;
  title: string;
  category: string;
  enrolled: boolean;
}

// Project Enrollment Component
const ProjectEnrollment = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "Networking & Cybersecurity",
      category: "Networking",
      enrolled: false,
    },
    {
      id: 2,
      title: "Mobile & Web App Development",
      category: "Development",
      enrolled: false,
    },
    {
      id: 3,
      title: "Machine Learning & Data Science",
      category: "AI & ML",
      enrolled: false,
    },
    { id: 4, title: "Internet of Things", category: "IoT", enrolled: false },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const { data } = await getStudentData();
        if (data?.studentData?.project_name) {
          setProjects((prev) =>
            prev.map((p) =>
              p.title === data.studentData.project_name
                ? { ...p, enrolled: true }
                : p
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch student data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollment();
  }, []);

  const handleEnroll = async (project: Project) => {
    try {
      const { data } = await enrollProject({
        projectTitle: project.title,
        projectCategory: project.category,
      });
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, enrolled: true } : p))
        );
        alert("✅ Enrolled successfully!");
      }
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("❌ Failed to enroll. Please try again.");
    }
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="project-enrollment">
      <h2>Available Projects</h2>
      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <p>Category: {project.category}</p>
            <p>Status: {project.enrolled ? "Enrolled" : "Available"}</p>
            {!project.enrolled && (
              <button onClick={() => handleEnroll(project)}>Enroll</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Proposal Upload Component
// const ProposalUpload = () => {
//   const [proposal, setProposal] = useState({
//     title: "",
//     description: "",
//     file: null as File | null,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (proposal.file) {
//       alert("Proposal submitted successfully!");
//       setProposal({ title: "", description: "", file: null });
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setProposal({ ...proposal, file: e.target.files[0] });
//     }
//   };

//   return (
//     <div className="proposal-upload">
//       <h2>Project Proposal Submission</h2>
//       <form onSubmit={handleSubmit} className="proposal-form">
//         <div className="form-group">
//           <label>Project Title:</label>
//           <input
//             type="text"
//             value={proposal.title}
//             onChange={(e) =>
//               setProposal({ ...proposal, title: e.target.value })
//             }
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Project Description:</label>
//           <textarea
//             value={proposal.description}
//             onChange={(e) =>
//               setProposal({ ...proposal, description: e.target.value })
//             }
//             rows={4}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Upload Proposal Document:</label>
//           <input
//             type="file"
//             accept=".pdf,.doc,.docx"
//             onChange={handleFileChange}
//             required
//           />
//         </div>

//         <button type="submit" className="submit-btn">
//           Submit Proposal
//         </button>
//       </form>
//     </div>
//   );
// };

// Documentation Upload Component

const ProposalUpload = () => {
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProposal({ ...proposal, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposal.file) {
      alert("Please upload your proposal document!");
      return;
    }

    try {
      setUploading(true);

      // ⬇️ Prepare FormData to send to backend
      const formData = new FormData();
      formData.append("title", proposal.title);
      formData.append("description", proposal.description);
      formData.append("file", proposal.file);

      // ⬇️ Send to backend (studentApi handles cookies + URL)
      const res = await submitProposal(formData);

      if (res.data.success) {
        alert("✅ Proposal submitted successfully!");
        setProposal({ title: "", description: "", file: null });
      } else {
        alert("⚠️ " + res.data.message);
      }
    } catch (error) {
      console.error("❌ Proposal submission failed:", error);
      alert("Error submitting proposal. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="proposal-upload">
      <h2>Project Proposal Submission</h2>
      <form onSubmit={handleSubmit} className="proposal-form">
        <div className="form-group">
          <label>Project Title:</label>
          <input
            type="text"
            value={proposal.title}
            onChange={(e) =>
              setProposal({ ...proposal, title: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Project Description:</label>
          <textarea
            value={proposal.description}
            onChange={(e) =>
              setProposal({ ...proposal, description: e.target.value })
            }
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload Proposal Document:</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
};
// Documentation Upload Component
const DocumentationUpload = () => {
  const [documentation, setDocumentation] = useState({
    documentType: "progress-report",
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentation.file) {
      alert("Please select a file before submitting!");
      return;
    }

    // ✅ Prepare form data for backend
    const formData = new FormData();
    formData.append("documentType", documentation.documentType);
    formData.append("file", documentation.file);

    try {
      // ✅ Send to backend
      const res = await uploadDocumentation(formData);
      console.log("✅ Upload success:", res.data);
      alert("Documentation uploaded successfully!");

      // Reset form
      setDocumentation({
        documentType: "progress-report",
        file: null,
      });
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("Failed to upload documentation. Check console for details.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentation({ ...documentation, file: e.target.files[0] });
    }
  };

  return (
    <div className="documentation-upload">
      <h2>Project Documentation Upload</h2>
      <form onSubmit={handleSubmit} className="documentation-form">
        <div className="form-group">
          <label>Document Type:</label>
          <select
            value={documentation.documentType}
            onChange={(e) =>
              setDocumentation({
                ...documentation,
                documentType: e.target.value,
              })
            }
          >
            <option value="progress-report">Progress Report</option>
            <option value="final-report">Final Report</option>
            <option value="presentation">Presentation Slides</option>
            <option value="source-code">Source Code</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Document:</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip,.rar"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Upload Documentation
        </button>
      </form>
    </div>
  );
};

// Progress Tracker Component
const ProgressTracker = () => {
  const [progressData] = useState([
    { stage: "Project Enrollment", status: "Completed", date: "2024-01-15" },
    {
      stage: "Proposal Submission",
      status: "Under Review",
      date: "2024-01-20",
    },
    { stage: "Proposal Approval", status: "Pending", date: "-" },
    { stage: "Documentation Upload", status: "Not Started", date: "-" },
    { stage: "Final Submission", status: "Not Started", date: "-" },
  ]);

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace(" ", "-");
  };

  return (
    <div className="progress-tracker">
      <h2>Project Progress Tracker</h2>
      <div className="progress-steps">
        {progressData.map((step, index) => (
          <div
            key={index}
            className={`progress-step ${getStatusClass(step.status)}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <h4>{step.stage}</h4>
              <p>Status: {step.status}</p>
              <p>Date: {step.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Statistics */}
      <div className="progress-stats">
        <h3>Project Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Completed</h4>
            <p className="stat-number">1/5</p>
            <p>20%</p>
          </div>
          <div className="stat-card">
            <h4>In Progress</h4>
            <p className="stat-number">1/5</p>
            <p>20%</p>
          </div>
          <div className="stat-card">
            <h4>Pending</h4>
            <p className="stat-number">3/5</p>
            <p>60%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Student Component
const StudentMain = () => {
  const [activeTab, setActiveTab] = useState("enrollment");

  const renderContent = () => {
    switch (activeTab) {
      case "enrollment":
        return <ProjectEnrollment />;
      case "proposal":
        return <ProposalUpload />;
      case "documentation":
        return <DocumentationUpload />;
      case "progress":
        return <ProgressTracker />;
      default:
        return <ProjectEnrollment />;
    }
  };

  return (
    <div className="student-main">
      <div className="student-sidebar">
        <h3>Student Dashboard</h3>
        <button
          className={activeTab === "enrollment" ? "active" : ""}
          onClick={() => setActiveTab("enrollment")}
        >
          📚 Project Enrollment
        </button>
        <button
          className={activeTab === "proposal" ? "active" : ""}
          onClick={() => setActiveTab("proposal")}
        >
          📝 Proposal Submission
        </button>
        <button
          className={activeTab === "documentation" ? "active" : ""}
          onClick={() => setActiveTab("documentation")}
        >
          📄 Documentation Upload
        </button>
        <button
          className={activeTab === "progress" ? "active" : ""}
          onClick={() => setActiveTab("progress")}
        >
          📊 Progress Tracker
        </button>
      </div>

      <div className="student-content">{renderContent()}</div>
    </div>
  );
};

export default StudentMain;
