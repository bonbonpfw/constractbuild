import {useState} from 'react';
import {deleteProject} from '../../api';
import {useRouter} from 'next/router';
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";

const useDeleteProject = (id: string | null) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    if (id) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteProject(id);
      router.push('/projects');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to delete project');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return {
    isDeleteDialogOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};

export default useDeleteProject;