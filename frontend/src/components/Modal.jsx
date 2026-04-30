import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { hide as hideModal } from '../store/modal';

const Modal = () => {
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(hideModal());
  };

  return (
    <div className="fixed inset-0 h-screen w-screen z-50 overflow-hidden p-4">
      <div
        className="absolute z-10 inset-0 bg-black bg-opacity-[.65]"
        onClick={handleClose}
      />
    </div>
  );
};

export default Modal;
