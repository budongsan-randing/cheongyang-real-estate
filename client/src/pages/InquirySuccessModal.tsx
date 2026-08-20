import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type InquirySuccessModalProps = {
  onClose: () => void;
};

export default function InquirySuccessModal({ onClose }: InquirySuccessModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="inquiry-success-dialog" showCloseButton={false}>
        <DialogHeader>
          <div className="inquiry-success-icon"><CheckCircle2 size={31} strokeWidth={1.8} /></div>
          <p className="eyebrow">INQUIRY RECEIVED</p>
          <DialogTitle>문의가 정상적으로<br />접수되었습니다.</DialogTitle>
          <DialogDescription>남겨주신 내용을 확인한 뒤, 입력하신 연락처로 안내드리겠습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button type="button" className="success-dialog-close" onClick={onClose}>확인했습니다 <ArrowRight size={16} /></button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
