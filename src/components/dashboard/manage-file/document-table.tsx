import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, FileText } from "lucide-react";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/config/firebase";
import { Button } from "@/components/ui/button";
import UploadFileComponent from "./upload-file-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import { pythonAiService } from "@/services/pythonAi";
import { useDocumentContractContext } from "@/contexts/document-contract-context";

export interface IDocument {
  id: string;
  documentNumber: string;
  date: string;
  title: string;
  isActive: boolean;
  year: number;
  uploaded_files: FileList | null;
}

interface DocumentsTableProps {
  year: string;
}

export function DocumentsTable({ year }: DocumentsTableProps) {
  const { getEthereumContract } = useDocumentContractContext();

  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<IDocument | null>(
    null
  );

  const [formData, setFormData] = useState<IDocument>({
    documentNumber: "",
    date: "",
    title: "",
    isActive: true,
    uploaded_files: null,
    id: uuidv4(),
    year: parseInt(year),
  });

  // Fetch documents from Firebase
  useEffect(() => {
    const functionMakeGroup = (data: IDocument[]) => {
      const grouped: {
        [documentNumber: string]: IDocument[];
      } = {};

      data.forEach((doc) => {
        const { documentNumber } = doc;
        if (!grouped[documentNumber]) {
          grouped[documentNumber] = [];
        }
        grouped[documentNumber].push(doc);
      });

      // Gom content theo thứ tự id
      const result = Object.entries(grouped).map(([docNumber, items]) => {
        const sorted = items.sort((a, b) => Number(a.id) - Number(b.id));

        console.log("itesm sorted", sorted);
        const ids = sorted.map((item) => item.id).join(",");
        return { ...sorted[0], id: ids };
      });

      console.log(result);

      return result;
    };

    const fetchDocumentOnContract = async () => {
      const contract = await getEthereumContract();
      await contract.getAllRecords().then((tx) => {
        console.log(tx);

        setDocuments(
          functionMakeGroup(
            tx.map((item: any) => {
              return {
                documentNumber: item.documentNumber,
                date: item.createdAt,
                title: item.title,
                isActive: item.status === "active" ? true : false,
                id: item.id,
                year: item.createdAt.split("-")[0],
                uploaded_files: null,
              } as IDocument;
            })
          )
        );
      });
    };
    fetchDocumentOnContract();
  }, [year]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      documentNumber: "",
      date: "",
      title: "",
      isActive: true,
      uploaded_files: null,
      id: uuidv4(),
      year: parseInt(year),
    });
  };

  const handleTrainLai = async () => {
    const contract = await getEthereumContract();

    await Promise.all(
      documents
        .map((doc) => {
          return doc.id.split(",");
        })
        .flat()
        .map(async (id) => {
          return await contract.getRecord(id);
        })
    ).then(async (res) => {
      if (!res || res.length === 0) {
        alert("NO DATA");
        return;
      }
      console.log(res);
      await pythonAiService
        .trainBotOnServer(
          "2025",
          res.map((item) => (item.status === "active" ? item.content : ""))
        )
        .then((res) => {
          console.log(res);
        });
    });
  };

  const handleAddDocument = async () => {
    const contract = await getEthereumContract();
    try {
      await pythonAiService
        .addDocument(formData, year)
        .then(async (res) => {
          console.log(res);

          const chunkSize = 4;
          const chunks = [];

          for (let i = 0; i < res.filename.length; i += chunkSize) {
            chunks.push(res.filename.slice(i, i + chunkSize));
          }

          await Promise.all(
            chunks.map(
              async (chunk) =>
                await contract
                  .createRecord(
                    formData.documentNumber,
                    formData.title,
                    chunk.join("</br>"),
                    formData.date
                  )
                  .then((tx) => console.log("MY TEX", tx))
            )
          ).then((res) => {
            console.log(res);

            resetForm();

            toast("Success", {
              description: "Document added successfully.",
            });
            setIsAddDialogOpen(false);
          });
        })
        .catch((error) => {
          console.error("Error adding document:", error);
        });
    } catch {
      toast("Error", {
        description: "",
      });
    }
  };

  const handleEditDocument = async () => {
    if (!currentDocument) return;

    try {
      const updatedDocument = {
        ...currentDocument,
        ...formData,
      };

      await updateDoc(doc(db, "documents", currentDocument.id), {
        documentNumber: formData.documentNumber,
        date: formData.date,
        title: formData.title,
        isActive: formData.isActive,
      });

      setDocuments(
        documents.map((doc) =>
          doc.id === currentDocument.id ? updatedDocument : doc
        )
      );
      setIsEditDialogOpen(false);
      setCurrentDocument(null);

      toast("Success", {
        description: "Document updated successfully.",
      });
    } catch (error) {
      console.error("Error updating document:", error);
      toast("Error", {
        description: "Failed to update document. Please try again.",
      });
    }
  };

  const handleDeleteDocument = async () => {
    if (!currentDocument) return;

    try {
      await deleteDoc(doc(db, "documents", currentDocument.id));

      setDocuments(documents.filter((doc) => doc.id !== currentDocument.id));
      setIsDeleteDialogOpen(false);
      setCurrentDocument(null);

      toast("Success", {
        description: "Document deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast("Error", {
        description: "Failed to delete document. Please try again.",
      });
    }
  };

  const handleToggleActive = async (document: IDocument) => {
    try {
      const updatedDocument = { ...document, isActive: !document.isActive };

      await updateDoc(doc(db, "documents", document.id), {
        isActive: !document.isActive,
      });
      const contract = await getEthereumContract();

      await Promise.all(
        document.id
          .split(",")
          .map(
            async (id) =>
              await contract.updateRecordStatus(
                id,
                document.isActive ? "inactive" : "active"
              )
          )
      ).then((res) => {
        console.log("res update status", res);
        toast("Success", {
          description: `Document ${
            updatedDocument.isActive ? "activated" : "deactivated"
          } successfully.`,
        });
      });
    } catch (error) {
      console.error("Error toggling document status:", error);
      toast("Error", {
        description: "Failed to update document status. Please try again.",
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    // In a real application, you would upload these files to your server
    // This is just a mock implementation

    // setUploadedFiles((prev) => [...prev, ...newFiles]);
    setFormData((prev) => ({
      ...prev,
      uploaded_files: files,
    }));
  };

  // const openEditDialog = (document: IDocument) => {
  //   setCurrentDocument(document);
  //   setFormData((prev) => ({
  //     ...prev,
  //     documentNumber: document.documentNumber,
  //     date: document.date,
  //     title: document.title,
  //     isActive: document.isActive,
  //     uploaded_files: document.uploaded_files,
  //   }));
  //   setIsEditDialogOpen(true);
  // };

  // const openDeleteDialog = (document: IDocument) => {
  //   setCurrentDocument(document);
  //   setIsDeleteDialogOpen(true);
  // };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="flex flex-row items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Văn bản năm {year}</h2>
        <Button
          variant={"default"}
          className="items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm văn bản1
        </Button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-500">
                    Số
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">
                    Ngày hiệu lực
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-500">
                    Tên văn bản
                  </th>
                  <th className="py-3 px-4 text-center font-medium text-gray-500">
                    Active
                  </th>
                  {/* <th className="py-3 px-4 text-right font-medium text-gray-500">
                    Thao tác
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Không có văn bản nào</p>
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{document.documentNumber}</td>
                      <td className="py-3 px-4">
                        {new Date(document.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <a
                          href={"/master-user/ban-hanh" + "/" + document.id}
                          className="text-blue-500 hover:underline"
                        >
                          {document.title}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={document.isActive}
                            onChange={() => handleToggleActive(document)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      {/* <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="p-1 rounded-md hover:bg-gray-100"
                            onClick={() => openEditDialog(document)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 rounded-md hover:bg-gray-100"
                            onClick={() => openDeleteDialog(document)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <Dialog defaultOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="h-[80%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm văn bản mới</DialogTitle>
              <DialogDescription>
                Điền thông tin văn bản mới vào form dưới đây.
              </DialogDescription>
            </DialogHeader>

            <div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="documentNumber"
                    className="text-right text-sm font-medium"
                  >
                    Số
                  </label>
                  <input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="date"
                    className="text-right text-sm font-medium"
                  >
                    Ngày hiệu lực
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="title"
                    className="text-right text-sm font-medium"
                  >
                    Tên văn bản
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <UploadFileComponent handleFileUpload={handleFileUpload} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="isActive"
                    className="text-right text-sm font-medium"
                  >
                    Kích hoạt
                  </label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm">
                      {formData.isActive ? "Đang kích hoạt" : "Không kích hoạt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant={"secondary"}
                className="px-4 py-2 border rounded-md"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 text-white rounded-md"
                onClick={handleAddDocument}
              >
                Lưu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <Dialog
          defaultOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        >
          <DialogContent className="h-[80%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm văn bản mới</DialogTitle>
              <DialogDescription>
                Điền thông tin văn bản mới vào form dưới đây.
              </DialogDescription>
            </DialogHeader>

            <div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="documentNumber"
                    className="text-right text-sm font-medium"
                  >
                    Số
                  </label>
                  <input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="date"
                    className="text-right text-sm font-medium"
                  >
                    Ngày hiệu lực
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="title"
                    className="text-right text-sm font-medium"
                  >
                    Tên văn bản
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <UploadFileComponent handleFileUpload={handleFileUpload} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="isActive"
                    className="text-right text-sm font-medium"
                  >
                    Kích hoạt
                  </label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm">
                      {formData.isActive ? "Đang kích hoạt" : "Không kích hoạt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant={"secondary"}
                className="px-4 py-2 border rounded-md"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 text-white rounded-md"
                onClick={handleEditDocument}
              >
                Lưu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <Dialog
          defaultOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent className="h-[80%] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm văn bản mới</DialogTitle>
              <DialogDescription>
                Điền thông tin văn bản mới vào form dưới đây.
              </DialogDescription>
            </DialogHeader>

            <div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="documentNumber"
                    className="text-right text-sm font-medium"
                  >
                    Số
                  </label>
                  <input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="date"
                    className="text-right text-sm font-medium"
                  >
                    Ngày hiệu lực
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="title"
                    className="text-right text-sm font-medium"
                  >
                    Tên văn bản
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <UploadFileComponent handleFileUpload={handleFileUpload} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="isActive"
                    className="text-right text-sm font-medium"
                  >
                    Kích hoạt
                  </label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm">
                      {formData.isActive ? "Đang kích hoạt" : "Không kích hoạt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant={"secondary"}
                className="px-4 py-2 border rounded-md"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="px-4 py-2 text-white rounded-md"
                onClick={handleDeleteDocument}
              >
                Lưu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Button onClick={handleTrainLai}>Train lại</Button>
    </div>
  );
}
