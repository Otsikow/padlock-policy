
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface PolicyModalsProps {
  showCancelModal: boolean;
  showSwitchModal: boolean;
  onCancelModalChange: (open: boolean) => void;
  onSwitchModalChange: (open: boolean) => void;
  onConfirmCancel: () => void;
  onConfirmSwitch: () => void;
}

const PolicyModals = ({
  showCancelModal,
  showSwitchModal,
  onCancelModalChange,
  onSwitchModalChange,
  onConfirmCancel,
  onConfirmSwitch
}: PolicyModalsProps) => {
  return (
    <>
      {/* Cancel Policy Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={onCancelModalChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Cancel Policy
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this policy? This action cannot be undone and you may lose coverage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onCancelModalChange(false)}>
              No, Keep Policy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmCancel}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Switch Policy Modal */}
      <AlertDialog open={showSwitchModal} onOpenChange={onSwitchModalChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to Another Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to explore better insurance deals and switch to another policy? We'll show you competitive rates from other providers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onSwitchModalChange(false)}>
              No, Stay Here
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmSwitch}
              className="bg-gradient-to-r from-[#183B6B] to-[#2a5490] hover:from-[#1a3d6f] hover:to-[#2d5799]"
            >
              Yes, Find Better Deals
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PolicyModals;
