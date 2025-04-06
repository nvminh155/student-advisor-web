import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, FileText } from "lucide-react";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/config/firebase";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  documentNumber: string;
  date: string;
  title: string;
  isActive: boolean;
  year: number;
}

interface DocumentsTableProps {
  year: string;
}

export function DocumentsTable({ year }: DocumentsTableProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    documentNumber: "",
    date: "",
    title: "",
    isActive: true,
  });

  // Fetch documents from Firebase
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "documents"),
          where("year", "==", parseInt(year))
        );
        const querySnapshot = await getDocs(q);
        const fetchedDocuments: Document[] = [];

        querySnapshot.forEach((doc) => {
          fetchedDocuments.push({ id: doc.id, ...doc.data() } as Document);
        });

        setDocuments(fetchedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast("Error", {
          description: "Failed to fetch documents. Please try again.",
          richColors: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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
    });
  };

  const handleAddDocument = async () => {
    try {
      const newDocument = {
        ...formData,
        year: parseInt(year),
        id: Math.random().toString(36).substring(2, 9),
      };

      await setDoc(doc(db, "documents", newDocument.id), newDocument);

      setDocuments([...documents, newDocument as Document]);
      setIsAddDialogOpen(false);
      resetForm();

      toast("Success", {
        description: "Document added successfully.",
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast("Error", {
        description: "Failed to add document. Please try again.",
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

  const handleToggleActive = async (document: Document) => {
    try {
      const updatedDocument = { ...document, isActive: !document.isActive };

      await updateDoc(doc(db, "documents", document.id), {
        isActive: !document.isActive,
      });

      setDocuments(
        documents.map((doc) => (doc.id === document.id ? updatedDocument : doc))
      );

      toast("Success", {
        description: `Document ${
          updatedDocument.isActive ? "activated" : "deactivated"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error toggling document status:", error);
      toast("Error", {
        description: "Failed to update document status. Please try again.",
      });
    }
  };

  const openEditDialog = (document: Document) => {
    setCurrentDocument(document);
    setFormData({
      documentNumber: document.documentNumber,
      date: document.date,
      title: document.title,
      isActive: document.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (document: Document) => {
    setCurrentDocument(document);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="flex flex-row items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Văn bản năm {year}</h2>
        <Button
        variant={"secondary"}
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
                  <th className="py-3 px-4 text-right font-medium text-gray-500">
                    Thao tác
                  </th>
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
                        <a href="#" className="text-blue-500 hover:underline">
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
                      <td className="py-3 px-4 text-right">
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
                      </td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Thêm văn bản mới</h3>
              <p className="text-sm text-gray-500 mb-4">
                Điền thông tin văn bản mới vào form dưới đây.
              </p>
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
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleAddDocument}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Chỉnh sửa văn bản</h3>
              <p className="text-sm text-gray-500 mb-4">
                Chỉnh sửa thông tin văn bản.
              </p>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="edit-documentNumber"
                    className="text-right text-sm font-medium"
                  >
                    Số
                  </label>
                  <input
                    id="edit-documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="edit-date"
                    className="text-right text-sm font-medium"
                  >
                    Ngày hiệu lực
                  </label>
                  <input
                    id="edit-date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="edit-title"
                    className="text-right text-sm font-medium"
                  >
                    Tên văn bản
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="col-span-3 px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label
                    htmlFor="edit-isActive"
                    className="text-right text-sm font-medium"
                  >
                    Kích hoạt
                  </label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id="edit-isActive"
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
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleEditDocument}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa văn bản này không? Hành động này không
                thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={handleDeleteDocument}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
