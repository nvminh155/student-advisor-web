import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DocumentsTable,
  IDocument,
} from "@/components/dashboard/manage-file/document-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase";
import { cn } from "@/lib/utils";
import { collection, getDocs, query } from "firebase/firestore";
import { useParams } from "react-router-dom";

type TDocumentResponse = IDocument & {
  text_chunks: string[];
};

export default function ManageFilePage() {
  const { year = new Date().getFullYear().toString() } = useParams<{
    year: string;
  }>();

  const handleTrainBotOnServer = async () => {
    const queryFirebase = query(collection(db, "documents"));

    const getDocumentFromFirebase = await getDocs(queryFirebase);

    const documents = getDocumentFromFirebase.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TDocumentResponse[];

    const documentsStillActive = documents.filter(
      (doc) => doc.isActive === true
    );

    const response = await fetch(
      "http://localhost:8000/train-bot-with-text-chunks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text_chunks: documentsStillActive
            .map((doc) => doc.text_chunks)
            .flat(),
          year: year,
        }),
      }
    );

    const data = await response.json();

    console.log("Response from server: ", data);
  };
  return (
    <DashboardShell>
      <DashboardHeader heading={`Văn bản chỉ đạo - điều hành`} />
      <div className="flex items-center mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/manage-file">
                Văn bản chỉ đạo - điều hành
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Năm {year}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <DocumentsTable year={year} />

      <Button
        className={cn("max-w-[150px] float-right")}
        onClick={handleTrainBotOnServer}
      >
        Train lại
      </Button>
    </DashboardShell>
  );
}
