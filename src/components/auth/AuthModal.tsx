import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "./Auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: any) => void;
  flatCard?: boolean;
  additionalText?: string;
  titleSingIn?: string;
  titleSignUp?: string;
}

export const AuthModal = ({ isOpen, onClose, onSuccess, flatCard, additionalText, titleSingIn, titleSignUp }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Auth onSuccess={(v) => {
          onSuccess(v);
          onClose();
        }} flatCard={flatCard} additionalText={additionalText} titleSingIn={titleSingIn} titleSignUp={titleSignUp} />
      </DialogContent>
    </Dialog>
  );
}; 
