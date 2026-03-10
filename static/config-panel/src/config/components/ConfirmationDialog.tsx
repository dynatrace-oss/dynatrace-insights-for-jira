import React from 'react';
import ModalDialog from '@atlaskit/modal-dialog/modal-dialog';
import ModalTransition from '@atlaskit/modal-dialog/modal-transition';
import Button from '@atlaskit/button/new';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  isPending = false
}) => {
  return (
    <ModalTransition>
      {isOpen && (
        <ModalDialog
          onClose={onClose}
          width="small"
        >
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '16px' }}>{title}</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                appearance="subtle"
                onClick={onClose}
                isDisabled={isPending}
              >
                {cancelButtonText}
              </Button>
              <Button
                appearance="danger"
                onClick={onConfirm}
                isDisabled={isPending}
              >
                {isPending ? 'Processing...' : confirmButtonText}
              </Button>
            </div>
          </div>
        </ModalDialog>
      )}
    </ModalTransition>
  );
};

export default ConfirmationDialog;
