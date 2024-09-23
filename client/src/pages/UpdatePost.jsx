import { Alert, Button, Select, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../../firebase";
import axios from "axios"; // Assuming you're using axios for HTTP requests
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function UpdatePost() {
  const { currentUser } = useSelector((state) => state.user);
  let navigate = useNavigate();
  const [imageUploadError, setImageUploadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    image: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageUrl, setImageUrl] = useState(""); // Store image URL
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null); // Ref to store Quill instance
  const { postId } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/post/getposts?postId=${postId}`);

        // If the response status is not OK, handle the error
        if (response.status >= 200 && response.status < 300) {
          setPublishError(null);
          setFormData(response.data.posts[0]); // Access data from response
          console.log(response.data.posts[0]);
        } else {
          // Handle non-200 status codes here if necessary
          setPublishError("Failed to fetch the post.");
        }
      } catch (error) {
        console.log(error.message);
        setPublishError(error.message); // Set error state
      }
    };

    fetchPost();
  }, [postId]);

  const handleUploadImageToFirebase = async (file) => {
    try {
      if (!file) return;

      // Check file size (2 MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFileSizeError("File size exceeds 2 MB");
        return;
      } else {
        setFileSizeError(null);
      }

      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress); // Update progress state
          },
          (error) => {
            setImageUploadError("Image upload failed");
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(100); // Set progress to 100% on completion
            setImageUrl(downloadURL); // Store the uploaded image URL
            resolve(downloadURL); // Return the uploaded image URL
          }
        );
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      category: formData.category,
      content: formData.content,
      image: imageUrl, // Add the image URL to the data
    };

    try {
      // const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      const response = await axios.put(
        `/api/post/updatepost/${formData._id}/${currentUser._id}`,
        postData
      );

      console.log(response);
      setPublishError(null);
      navigate(`/post/${response.data.savedPost.slug}`);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code that falls out of the range of 2xx
        setPublishError(error.response.data.message || "An error occurred");
      } else if (error.request) {
        // The request was made but no response was received
        setPublishError("No response received from the server");
      }
    }
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) {
        setImageUploadError("No file selected");
        return;
      }

      setImageUploadError(null); // Clear any previous error

      try {
        const imageUrl = await handleUploadImageToFirebase(file);
        const quill = quillInstanceRef.current;
        const range = quill.getSelection();
        if (range) {
          quill.insertEmbed(range.index, "image", imageUrl);
        } else {
          setImageUploadError("Failed to insert image");
        }
        setUploadProgress(0); // Reset progress after successful upload
      } catch (error) {
        setImageUploadError("Image upload failed");
      }
    };
  };

  //   useEffect(() => {
  //     const toolbarOptions = [
  //       ["bold", "italic", "underline"],
  //       [{ list: "ordered" }, { list: "bullet" }],
  //       [{ align: [] }],
  //       ["link", "image"], // Image button in toolbar
  //       [{ size: ["small", false, "large", "huge"] }],
  //       [{ color: [] }, { background: [] }],
  //       [{ header: [1, 2, 3, false] }],
  //       ["clean"],
  //     ];

  //     const quill = new Quill(quillRef.current, {
  //       modules: {
  //         toolbar: {
  //           container: toolbarOptions,
  //           handlers: {
  //             image: imageHandler, // Custom image handler
  //           },
  //         },
  //       },
  //       theme: "snow",
  //     });

  //     quillInstanceRef.current = quill; // Store Quill instance in ref

  //     quill.on("text-change", () => {
  //       setFormData({ ...formData, content: quill.root.innerHTML });
  //     });
  //   }, []);
  // useEffect(() => {
  //   const initializeQuill = () => {
  //     const toolbarOptions = [
  //       ["bold", "italic", "underline"],
  //       [{ list: "ordered" }, { list: "bullet" }],
  //       [{ align: [] }],
  //       ["link", "image"],
  //       [{ size: ["small", false, "large", "huge"] }],
  //       [{ color: [] }, { background: [] }],
  //       [{ header: [1, 2, 3, false] }],
  //       ["clean"],
  //     ];

  //     const quill = new Quill(quillRef.current, {
  //       modules: {
  //         toolbar: {
  //           container: toolbarOptions,
  //           handlers: {
  //             image: imageHandler,
  //           },
  //         },
  //       },
  //       theme: "snow",
  //     });

  //     quillInstanceRef.current = quill;

  //     quill.on("text-change", () => {
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         content: quill.root.innerHTML,
  //       }));
  //     });
  //   };

  //   initializeQuill();
  // }, []);

  // useEffect(() => {
  //   const initializeQuill = () => {
  //     const toolbarOptions = [
  //       ["bold", "italic", "underline"],
  //       [{ list: "ordered" }, { list: "bullet" }],
  //       [{ align: [] }],
  //       ["link", "image"],
  //       [{ size: ["small", false, "large", "huge"] }],
  //       [{ color: [] }, { background: [] }],
  //       [{ header: [1, 2, 3, false] }],
  //       [{ direction: "rtl" }], // Added direction option for RTL
  //       ["clean"],
  //     ];

  //     const quill = new Quill(quillRef.current, {
  //       modules: {
  //         toolbar: {
  //           container: toolbarOptions,
  //           handlers: {
  //             image: imageHandler,
  //           },
  //         },
  //       },
  //       theme: "snow",
  //     });

  //     quillInstanceRef.current = quill;

  //     quill.on("text-change", () => {
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         content: quill.root.innerHTML, // Changed to innerHTML
  //       }));
  //     });
  //   };

  //   initializeQuill();
  // }, []);

  useEffect(() => {
    const initializeQuill = () => {
      const toolbarOptions = [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        [{ header: [1, 2, 3, false] }],
        // Removed direction: 'rtl', it defaults to 'ltr'
        ["clean"],
      ];

      const quill = new Quill(quillRef.current, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: imageHandler,
            },
          },
        },
        theme: "snow",
        placeholder: "Write something...", // Optional
      });

      quillInstanceRef.current = quill;

      quill.on("text-change", () => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          content: quill.root.innerHTML, // Storing the content in HTML format
        }));
      });

      // Ensure the direction is explicitly set to LTR
      quill.root.setAttribute("dir", "ltr");
    };

    initializeQuill();
  }, []);

  useEffect(() => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.root.innerHTML = formData.content; // This should be HTML
    }
  }, [quillInstanceRef.current]);
  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="javascript">JavaScript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>

        {fileSizeError && <Alert color="failure">{fileSizeError}</Alert>}
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-purple-600 h-4 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="h-72 mb-6">
          <div ref={quillRef} id="editor" />
        </div>

        <Button
          type="submit"
          gradientDuoTone="purpleToPink"
          className="mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update"}
        </Button>

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}

export default UpdatePost;
