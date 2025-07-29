import {useState} from 'react';
import {deleteProject} from '../../api';
import {useRouter} from 'next/router';
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";
import {toast} from 'react-toastify';

const useDeleteProject = (id: string | null) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (id) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    console.log("Starting project deletion process for ID:", id);
    
    try {
      // First delete the project
      console.log("Calling deleteProject API function");
      await deleteProject(id);
      console.log("Delete API call completed successfully");
      
      // Show success toast
      toast.success("Project deleted successfully");
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      
      // Then redirect to projects page
      console.log("Redirecting to projects page");
      router.push('/projects');
    } catch (error) {
      console.error("Error during project deletion:", error);
      errorHandler(error as ErrorResponseData, 'Failed to delete project');
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return {
    isDeleteDialogOpen,
    isDeleting,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};

export default useDeleteProject;