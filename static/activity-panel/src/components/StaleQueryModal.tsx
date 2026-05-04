import Button from '@atlaskit/button/new';
import ModalDialog, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';

interface StaleQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunQuery: () => void;
}

export function StaleQueryModal({ isOpen, onClose, onRunQuery }: StaleQueryModalProps) {
  return (
    <ModalTransition>
      {isOpen && (
        <ModalDialog onClose={onClose} width="small">
          <ModalHeader>
            <ModalTitle appearance="warning">Query has changed</ModalTitle>
          </ModalHeader>
          <ModalBody>
            The chart shows results from a previous run. Run the query again to update it before sharing.
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={onClose}>Cancel</Button>
            <Button appearance="warning" onClick={() => { onClose(); onRunQuery(); }}>Run Query</Button>
          </ModalFooter>
        </ModalDialog>
      )}
    </ModalTransition>
  );
}
