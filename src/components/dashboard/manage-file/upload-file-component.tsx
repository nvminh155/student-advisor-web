import { useState } from "react";
import { FileUpload } from "../file-upload";


type FileUploadProps = {
  handleFileUpload: (files: FileList) => void;
}

const UploadFileComponent = ({handleFileUpload}: FileUploadProps) => {
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

  

  console.log("Uploaded files:", uploadedFiles);
  // You can use the uploadedFiles state to display the list of uploaded files
  return <FileUpload onUpload={handleFileUpload} />;
};


export default UploadFileComponent;
// Compare this snippet from src/components/dashboard/manage-file/upload-file-component.tsx: