import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../components/DashSideBar";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";
import DashboardComp from "../components/DashboardComp";

function DashBoard() {
  const location = useLocation(); // give us the current path /profile /new  and have the seatch method then return value after ? questation mark

  const [tab, setTab] = useState(""); // this will save the tab or page to go
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    console.log(tabFromUrl);
    // console.log(tabFromUrl);
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  console.log(location);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        <DashSideBar />
      </div>

      <div>{tab === "profile" && <DashProfile />}</div>
      <div>{tab === "posts" && <DashPosts />}</div>
      <div>{tab === "users" && <DashUsers />}</div>
      <div> {tab === "comments" && <DashComments />}</div>
      <div>{tab === "dash" && <DashboardComp />}</div>
    </div>
  );
}

export default DashBoard;
