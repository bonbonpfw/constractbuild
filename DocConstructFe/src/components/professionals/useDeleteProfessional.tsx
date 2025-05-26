import {useState} from 'react';
import {deleteProfessional} from '../../api';
import {useRouter} from 'next/router';
import {errorHandler, ErrorResponseData} from "../shared/ErrorHandler";

const useDeleteProfessional = (id: string | null) => {
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
      await deleteProfessional(id);
      router.push('/professionals');
    } catch (error) {
      errorHandler(error as ErrorResponseData, 'Failed to delete professional');
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

export default useDeleteProfessional;