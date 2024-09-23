import React, { useEffect, useState } from "react";
import { Sidebar } from "flowbite-react";
import {
  HiAnnotation,
  HiArrowSmRight,
  HiChartPie,
  HiDocumentText,
  HiOutlineUserGroup,
  HiUser,
} from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

import { signoutSuccess } from "../../redux/user/userSlice.js";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
function DashSideBar() {
  let dispatch = useDispatch();
  const location = useLocation(); // Get current location including query string
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState(""); // State to save current tab

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    console.log("Tab from URL:", tabFromUrl); // Debug value of tabFromUrl
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  // Determine if the current tab is 'profile'
  //   const isProfileActive = ;

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

  return (
    <>
      <Sidebar className="w-full md:w-56">
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-1">
            {currentUser && currentUser.isAdmin && (
              <Link to="/dashboard?tab=dash">
                <Sidebar.Item
                  active={tab === "dash" || !tab}
                  icon={HiChartPie}
                  as="div"
                >
                  Dashboard
                </Sidebar.Item>
              </Link>
            )}

            <Link to="/dashboard?tab=profile">
              <Sidebar.Item
                active={tab === "profile"} // Apply active state based on isProfileActive
                icon={HiUser}
                label={currentUser.isAdmin ? "Admin" : "User"}
                labelColor="dark"
                as="div"
              >
                Profile
              </Sidebar.Item>
            </Link>

            {currentUser.isAdmin && (
              <>
                <Link to="/dashboard?tab=posts">
                  <Sidebar.Item
                    active={tab === "posts"}
                    icon={HiDocumentText}
                    as="div"
                  >
                    Posts
                  </Sidebar.Item>
                </Link>
              </>
            )}

            {currentUser.isAdmin && (
              <>
                <Link to="/dashboard?tab=users">
                  <Sidebar.Item
                    active={tab === "users"}
                    icon={HiOutlineUserGroup}
                    as="div"
                  >
                    Users
                  </Sidebar.Item>
                </Link>

                <Link to="/dashboard?tab=comments">
                  <Sidebar.Item
                    active={tab === "comments"}
                    icon={HiAnnotation}
                    as="div"
                  >
                    Comments
                  </Sidebar.Item>
                </Link>
              </>
            )}

            <Sidebar.Item
              icon={HiArrowSmRight}
              labelColor={"dark"}
              onClick={handleSignout}
            >
              Sign Out
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </>
  );
}

export default DashSideBar;
