import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDefaultAddress, updateDefaultAddress } from "@/api/profile";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentStore } from "@/stores/paymentStore";
import { toast } from "react-toastify";

const ShippingForm: React.FC = () => {
  const {
    data: user,
    isPending: isAuthLoading,
    isError: isAuthError,
    error: authError,
  } = useAuth();
  const userId = user?.id || "";

  const queryClient = useQueryClient();
  const {
    shippingAddress,
    setShippingAddress,
    isUsingDefault,
    setIsUsingDefault,
  } = usePaymentStore();

  //기본 배송지 불러오기
  const { data: defaultAddress } = useQuery({
    queryKey: ["defaultShippingAddress", userId],
    queryFn: () => getDefaultAddress(userId),
    enabled: !!userId,
  });

  // 기본배송지가 있는 경우
  useEffect(() => {
    if (defaultAddress) {
      setShippingAddress(defaultAddress);
      setIsUsingDefault(true);
    } else {
      setIsUsingDefault(false);
    }
  }, [defaultAddress, setShippingAddress, setIsUsingDefault]);

  // 기본 배송지 업데이트
  const mutation = useMutation({
    mutationFn: (newAddress: string) =>
      updateDefaultAddress(userId, newAddress),
    onSuccess: () => {
      toast.success("기본 배송지로 등록되었습니다.");
      setIsUsingDefault(true);
      queryClient.invalidateQueries({
        queryKey: ["defaultShippingAddress", userId],
      });
    },
    onError: (error: Error) => {
      toast.error(`기본 배송지 등록 실패: ${error.message}`);
      console.error(error);
    },
  });

  const handleUseDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsUsingDefault(checked);
    if (checked && defaultAddress) {
      setShippingAddress(defaultAddress);
    } else {
      setShippingAddress("");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShippingAddress(e.target.value);
  };

  //사용자가 새 배송지를 입력하고 포커스를 잃었을 때 기본배송지로 설정할 건지 묻기
  const handleBlur = () => {
    if (
      !isUsingDefault &&
      shippingAddress.trim() !== "" &&
      shippingAddress !== defaultAddress
    ) {
      const askSave = window.confirm(
        "입력한 배송지를 기본 배송지로 등록하시겠습니까?"
      );
      if (askSave) {
        mutation.mutate(shippingAddress);
      }
    }
  };

  if (isAuthLoading) return <div>기본 배송지 로딩 중...</div>;
  if (isAuthError)
    return (
      <div className="text-red-500">배송지 로딩 오류: {authError.message}</div>
    );

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">배송지 정보</h2>

      {/* 기본 배송지 등록이 되어 있는 경우 */}
      {defaultAddress && (
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isUsingDefault}
              onChange={handleUseDefaultChange}
              className="form-checkbox"
            />
            <span className="ml-2">기본 배송지 사용</span>
          </label>
        </div>
      )}

      {/* 기본 배송지가 아닌 배송지로 할 경우 */}
      {!isUsingDefault && (
        <textarea
          value={shippingAddress}
          onChange={handleAddressChange}
          onBlur={handleBlur}
          placeholder="배송지 주소를 입력해주세요."
          required
          className="w-full p-2 border-gray-300 rounded-md"
        ></textarea>
      )}

      {/* 기본 배송지 사용 시 배송지 정보 표시 */}
      {isUsingDefault && defaultAddress && (
        <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
          <p>{defaultAddress}</p>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;
