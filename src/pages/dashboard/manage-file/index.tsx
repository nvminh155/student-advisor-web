"use client";
import { FileUpload } from "@/components/dashboard/file-upload";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

const UploadFileComponent = () => {
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      uploadedAt: Date;
      url: string;
    }>
  >([]);

  const handleFileUpload = async (files: FileList) => {
    // In a real application, you would upload these files to your server
    // This is just a mock implementation
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  console.log("Uploaded files:", uploadedFiles);
  // You can use the uploadedFiles state to display the list of uploaded files
  return <FileUpload onUpload={handleFileUpload} />;
};

export default function ManageFile() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex flex-col flex-1 gap-5">
      <UploadFileComponent />
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
