import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { type ReactNode } from 'react';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Reusable modal component for quick actions within a module.
 * Used for: station details, prediction results, filters, settings.
 */
export function AppModal({ isOpen, onClose, title, children, footer, size = 'lg' }: AppModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      backdrop="blur"
      classNames={{
        base: 'bg-background/90 backdrop-blur-xl border border-white/10',
        header: 'border-b border-white/10',
        footer: 'border-t border-white/10',
      }}
    >
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
