// src/components/reviews/ReviewModal.tsx
import React from "react";
import Modal from "react-modal"; // 모달 UI 컴포넌트 (프로젝트에 맞게 구현)
import ReviewForm from "./ReviewForm";

interface ReviewModalProps {
  orderId: string;
  productId: string;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  productId,
  onClose,
}) => {
  return (
    <Modal isOpen={true} onRequestClose={onClose}>
      <ReviewForm orderId={orderId} productId={productId} onClose={onClose} />
    </Modal>
  );
};

export default ReviewModal;
