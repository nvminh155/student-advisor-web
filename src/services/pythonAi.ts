import { IDocument } from "@/components/dashboard/manage-file/document-table";
import { db } from "@/config/firebase";
import { collection, getDocs, query } from "firebase/firestore";

type TDocumentResponse = IDocument & {
  text_chunks: string[];
};

export const pythonAiService = {
  trainBotOnServer: async (year: string) => {
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

    return data;
  },

  addDocument: async (formData: IDocument, year: string) => {
    console.log(formData);
    try {
      const payload_formdata = new FormData();

      if (!formData.uploaded_files) {
        throw new Error("No files uploaded. ! Please upload files.");
      }

      for (const file of formData.uploaded_files) {
        payload_formdata.append("uploaded_files", file);
      }

      payload_formdata.append("documentNumber", formData.documentNumber);
      payload_formdata.append("date", formData.date);
      payload_formdata.append("title", formData.title);
      payload_formdata.append("isActive", formData.isActive.toString());
      payload_formdata.append("year", year);
      payload_formdata.append("id", formData.id);

      const res1 = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: payload_formdata,
      });

      const data = await res1.json();
      console.log("res1", data, res1);

      if (data.err) {
        throw new Error(data.err);
      }

      return data;
    } catch (error) {
      return error;
    }
  },
};
