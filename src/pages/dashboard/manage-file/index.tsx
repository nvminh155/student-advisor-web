"use client";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];


export default function ManageFile() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex flex-col flex-1 gap-5">
      {/* <UploadFileComponent /> */}
      <div className="w-64 h-full border-r bg-white">
        <div className="border-b px-4 py-2">
          <h2 className="text-lg font-semibold">Văn bản chỉ đạo - điều hành</h2>
        </div>
        <div className="py-2">
          <div className="gap-3 flex flex-col">
            {years.map((year) => (
              <button
                key={year}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-gray-100",
                  pathname === `/manage-file/${year}` &&
                    "bg-blue-600 text-white hover:bg-blue-700"
                )}
                onClick={() => navigate(`/manage-file/${year}`)}
              >
                Năm {year}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
