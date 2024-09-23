import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card"; // Adjust the path if necessary

function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const reposResponse = await axios.get(
          "https://api.github.com/users/inaveed-git/repos"
        );
        setProjects(reposResponse.data);

        const profileResponse = await axios.get(
          "https://api.github.com/users/inaveed-git"
        );
        setProfile(profileResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="px-4">
      {" "}
      {/* Add padding on the sides */}
      <div className="flex items-center mt-4">
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="w-16 h-16 rounded-full"
        />
        <h2 className="ml-4 text-xl">{profile.name || "Your Name"}</h2>
      </div>
      <div className="flex flex-row justify-center items-center mb-5 flex-wrap gap-8 mt-8">
        {" "}
        {/* Reduced gap and adjusted grid */}
        {projects.map((project) => (
          <Card key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Project;
