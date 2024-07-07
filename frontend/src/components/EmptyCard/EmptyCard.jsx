import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src={imgSrc} alt="No notes" className="w-40 " />

      <p className="w-1/2 text-sm font-medium  text-center leading-7 mt-5 text-white">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;
