import { Link } from "react-router-dom";

const Card = ({ project }) => {
  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[350px] overflow-hidden rounded-lg sm:w-[300px] transition-all">
      {" "}
      {/* Adjusted height and width */}
      <Link to={project.html_url} target="_blank" rel="noopener noreferrer">
        <img
          src={
            "https://www.bleepstatic.com/content/hl-images/2022/04/08/GitHub__headpic.jpg"
          } // Display the owner's avatar as the cover image
          alt="project cover"
          className="h-[200px] w-full object-cover group-hover:h-[180px] transition-all duration-300 z-20"
        />
      </Link>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">{project.name}</p>
        <span className="italic text-sm line-clamp-3">
          {project.description || "No description provided."}
        </span>
        <Link
          to={project.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
        >
          View Source Code
        </Link>
      </div>
    </div>
  );
};

export default Card;
