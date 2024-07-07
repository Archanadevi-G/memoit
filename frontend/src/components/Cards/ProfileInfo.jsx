import React from "react";
import { getInitials, getConsistentColorClass } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  if (!userInfo) {
    return <></>;
  }

  const bgColor = getConsistentColorClass(userInfo.fullName || userInfo.email);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 lg:w-12 lg:h-12 text-xs lg:text-lg flex items-center justify-center rounded-full text-slate-800 font-medium ${bgColor}`}
      >
        {getInitials(userInfo.fullName)}
      </div>
      <div>
        <p className="hidden lg:block text-sm font-medium text-white">
          {userInfo.fullName}
        </p>
        <button
          className="text-sm text-slate-300 hover:underline hover:scale-110 hover:text-red-500"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
