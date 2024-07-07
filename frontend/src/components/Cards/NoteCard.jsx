import React from "react";
import { MdOutlinePushPin, MdCreate, MdDelete } from "react-icons/md";
import moment from "moment";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="border border-gray-400 shadow-2xl shadow-zinc-700 rounded p-4   hover:shadow-slate-950 transition-all ease-in-out">
      <div className="flex items-center justify-between ">
        <div className="">
          <h6 className="text-base font-medium text-white">{title}</h6>
          <span className="text-xs text-slate-200">
            {moment(date).format("Do MMM YYYY")}
          </span>
        </div>

        <MdOutlinePushPin
          className={`icon-btn ${
            isPinned ? "text-primary text-2xl" : "text-slate-300"
          }`}
          onClick={onPinNote}
        />
      </div>
      <hr />
      <div className="mt-2">
        <p className="text-[16px] text-slate-300 overflow-hidden break-words">
          {content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-slate-800">
          {tags.map((item, index) => (
            <span
              key={index}
              className="border bg-slate-200 rounded  p-[2px] m-1"
            >
              #{item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 ">
          <MdCreate
            className="icon-btn  hover:text-green-600"
            onClick={onEdit}
          />
          <MdDelete
            className="icon-btn hover:text-red-600"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
