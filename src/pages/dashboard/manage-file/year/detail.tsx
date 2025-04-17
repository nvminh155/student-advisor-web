import { useDocumentContractContext } from "@/contexts/document-contract-context";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Record = {
  id: number;
  documentNumber: string;
  title: string;
  content: string;
  signerAddress: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
};
const FileDetail = () => {
  const { getEthereumContract } = useDocumentContractContext();
  const { id } = useParams<{ id: string }>();
  console.log(id, "id");
  const [doc, setDoc] = React.useState<Record | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;

      const contract = await getEthereumContract();
      // const doc = await contract.getRecord(id);

      await Promise.all(
        id?.split(",").map(async (item) => {
          return await contract.getRecord(item);
        })
      ).then((res) => {
        if (!res || res.length === 0) {
          alert("NO DATA");
          return;
        }

        console.log({
          documentNumber: res[0].documentNumber,
          title: res[0].title,
          content: res.map((item) => item.content).join("\n"),
        });

        setDoc({
          id: res[0].id,
          documentNumber: res[0].documentNumber,
          title: res[0].title,
          content: res.map((item) => item.content).join("\n"),
          signerAddress: res[0].signerAddress,
          fullName: res[0].fullName,
          role: res[0].role,
          status: res[0].status,
          createdAt: res[0].createdAt,
        });
      });

      // console.log(doc, "doc");
      // setDoc(doc);
      // setLoading(false);
    };
    fetchDoc();
  }, []);

  return (
    <div>
      FileDetail
      <div dangerouslySetInnerHTML={{ __html: doc?.content ?? "" }}></div>
    </div>
  );
};

export default FileDetail;
