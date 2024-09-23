import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Button, Modal, TextInput } from "flowbite-react";

import { CircularProgressbar } from "react-circular-progressbar";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import app from "../../firebase";

import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from "../../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
function DashProfile() {
  let dispatch = useDispatch();
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null); // in this we save our img that we get
  const [imageFileUrl, setImageFileUrl] = useState(null); // this well get the img after chagne it from img to url
  const filePickerRef = useRef(); // we are using this for to click on the image and performe same task input file

  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  console.log(imageFileUploadProgress, imageFileUploadError);
  const [formData, setFormData] = useState({});
  const [updateUserError, setUpdateUserError] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [updateUserError, setUpdateUserError] = useState(null);

  useEffect(() => {
    if (updateUserSuccess) {
      const timer = setTimeout(() => {
        setUpdateUserSuccess(null);
      }, 2000); // 2000ms = 2 seconds

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or the effect reruns
    }
  }, [updateUserSuccess]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Frontend validation for file size (2MB limit)
    const maxSizeInMB = 2; // Maximum file size in MB
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      setImageFileUploadError(`File size exceeds ${maxSizeInMB}MB limit`);
      setImageFile(null);
      return;
    }

    // Frontend validation for file type (images only)
    if (!file.type.startsWith("image/")) {
      setImageFileUploadError("Only image files are allowed");
      setImageFile(null);
      return;
    }

    // If validation passes, proceed with file upload
    setImageFile(file);
    setImageFileUrl(URL.createObjectURL(file)); // Create temporary URL for display
    setImageFileUploadError(null); // Clear any previous errors
  };

  useEffect(() => {
    //this will call the funtion when user choice new file
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    console.log("...uploading");
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app); // in here we are using the firebase storag and import it and the is the firebase config file app

    const fileName = new Date().getTime() + imageFile.name; //taking out or file name from the filename state and make it unique user can have many pic if two of them have same name then error can occur  by using data we can make it unique

    const storageRef = ref(storage, fileName); // this file ref ask for where to store and which file to store
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },

      (error) => {
        setImageFileUploadError("having some error");
        setImageFile(null);
        setImageFileUploadProgress(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }

    if (imageFileUploading) {
      setUpdateUserError("Wait for image to upload");
      return;
    }

    try {
      dispatch(updateStart());

      // Make a PUT request to update the user's profile using axios
      const res = await axios.put(
        `/api/user/update/${currentUser._id}`,
        formData
      );

      // The response object contains a `data` property where the server response is stored
      const data = res.data;

      // Check if the request was successful
      if (res.status !== 200) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      // If there is an error, handle it
      dispatch(updateFailure(error.response?.data?.message || error.message));
      setUpdateUserError(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      // const res = await fetch(`/api/user/delete/${currentUser._id}`, {
      //   method: "DELETE",
      // });

      const response = await axios.delete(
        `/api/user/delete/${currentUser._id}`
      );
      // const data = await res.json(`/api/user/delete/${currentUser._id}`);
      // if (!res.ok) {
      //   dispatch(deleteUserFailure(data.message));
      // } else {
      //   dispatch(deleteUserSuccess(data));

      if (response.status !== 200) {
        // dispatch(updateFailure(data.message));
        dispatch(deleteUserFailure(response.data.message));
        // setUpdateUserError(data.message);
      } else {
        // dispatch(updateSuccess(data));
        dispatch(deleteUserSuccess(response.data));
        // setUpdateUserSuccess("User's profile updated successfully");
      }
      // }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  let handleSignout = async () => {
    try {
      // const res = await fetch("/api/user/signout", {
      //   method: "POST",
      // });

      // const data = await res.json();

      let response = await axios.post("/api/user/signout");
      // if (!res.ok) {
      //   console.log(data.message);
      // } else {
      //   dispatch(signoutSuccess());
      // }

      if (response.status !== 200) {
        // dispatch(updateFailure(data.message));
        // dispatch(deleteUserFailure(response.data.message));
        console.log(response.message);
        // setUpdateUserError(data.message);
      } else {
        // dispatch(updateSuccess(data));
        dispatch(signoutSuccess());
        // setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  console.log(formData);
  return (
    <div className=" mx-auto p-3 md:w-[80vw] flex flex-col justify-center items-center">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>

      <form
        className="flex flex-col items-center gap-4 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-28 h-28 cursor-pointer shadow-md overflow-hidden rounded-full flex items-center justify-center"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}

          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={currentUser.username} // Use formData value or fallback to currentUser data
          onChange={handleInput}
          className="min-w-[60vw] text-lg md:min-w-[30vw]"
          required
        />

        <TextInput
          type="email"
          id="email"
          placeholder="Email"
          defaultValue={currentUser.email} // Use formData value or fallback to currentUser data
          onChange={handleInput}
          className="min-w-[60vw] text-lg md:min-w-[30vw]"
          required
        />

        <TextInput
          type="password"
          id="password"
          placeholder="Password"
          onChange={handleInput}
          className="min-w-[60vw] text-lg md:min-w-[30vw]"
        />

        <Button
          type="submit"
          className="min-w-[60vw] md:min-w-[30vw]"
          gradientDuoTone="purpleToBlue"
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? "Loading..." : "Update"}
        </Button>

        {currentUser.isAdmin && (
          <Link to={"/create-post"}>
            <Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="  min-w-[60vw] md:min-w-[30vw]"
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>

      <div className="text-gray-700 dark:text-gray-300 flex justify-between mt-5 w-[65%] md:w-[38%]">
        <span
          onClick={() => setShowModal(true)}
          className="cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          Delete Account
        </span>
        <span
          onClick={handleSignout}
          className="cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DashProfile;
