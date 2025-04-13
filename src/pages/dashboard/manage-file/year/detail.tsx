import { useDocumentContractContext } from '@/contexts/document-contract-context'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const {getEthereumContract} = useDocumentContractContext();
  const {id} = useParams<{id: string}>()
  console.log(id, "id")
  const [doc, setDoc] = React.useState<Record | null>(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    const fetchDoc = async () => {
      const contract = await getEthereumContract()
      const doc = await contract.getRecord(id);
      console.log(doc, "doc")
      setDoc(doc)
      setLoading(false)
    }
    fetchDoc()
  }, [])

  return (
    <div>FileDetail

      <div dangerouslySetInnerHTML={{__html: doc?.content ?? ""}}></div>
 
    </div>
  )
}

export default FileDetail