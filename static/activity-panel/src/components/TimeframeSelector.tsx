import { useState, useCallback } from 'react';
import Button from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition
} from '@atlaskit/modal-dialog';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import {
  TIMEFRAME_OPTIONS,
  isCustomTimeframe,
  formatTimeframeLabel,
  type TimeframeValue,
  type CustomTimeframe,
  type PredefinedTimeframe
} from '../utils/timeframe';

interface TimeframeSelectorProps {
  value: TimeframeValue
  onChange: (value: TimeframeValue) => void
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const handleOptionSelect = useCallback(
    (optionValue: PredefinedTimeframe | 'custom') => {
      if (optionValue === 'custom') {
        // Initialize with current value if it's custom, otherwise use last hour
        if (isCustomTimeframe(value)) {
          setCustomFrom(new Date(value.from).toISOString());
          setCustomTo(new Date(value.to).toISOString());
        } else {
          const now = new Date();
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          setCustomFrom(oneHourAgo.toISOString());
          setCustomTo(now.toISOString());
        }
        setIsCustomModalOpen(true);
      } else {
        onChange(optionValue);
      }
    },
    [onChange]
  );

  const handleCustomConfirm = useCallback(() => {
    const fromTimestamp = new Date(customFrom).getTime();
    const toTimestamp = new Date(customTo).getTime();

    const customValue: CustomTimeframe = {
      from: fromTimestamp,
      to: toTimestamp
    };
    onChange(customValue);
    setIsCustomModalOpen(false);
  }, [customFrom, customTo, onChange]);

  const handleCustomCancel = useCallback(() => {
    setIsCustomModalOpen(false);
  }, []);

  const isValidCustomRange =
    customFrom && customTo && new Date(customFrom).getTime() < new Date(customTo).getTime();

  const displayLabel = formatTimeframeLabel(value);

  return (
    <>
      <DropdownMenu trigger={displayLabel} shouldRenderToParent spacing="compact">
        <DropdownItemGroup>
          {TIMEFRAME_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              isSelected={
                option.value === 'custom'
                  ? isCustomTimeframe(value)
                  : option.value === value
              }
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownItemGroup>
      </DropdownMenu>

      <ModalTransition>
        {isCustomModalOpen && (
          <Modal onClose={handleCustomCancel} autoFocus={false}>
            <ModalHeader>
              <ModalTitle>Custom Timeframe</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date & Time
                  </label>
                  <DateTimePicker
                    value={customFrom}
                    onChange={(val: string) => setCustomFrom(val)}
                    datePickerProps={{ placeholder: 'Select start date' }}
                    timePickerProps={{
                      placeholder: 'Select start time',
                      times: ALL_HOURS
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date & Time
                  </label>
                  <DateTimePicker
                    value={customTo}
                    onChange={(val: string) => setCustomTo(val)}
                    datePickerProps={{ placeholder: 'Select end date' }}
                    timePickerProps={{
                      placeholder: 'Select end time',
                      times: ALL_HOURS
                    }}
                  />
                </div>
                {customFrom && customTo && !isValidCustomRange && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Start date/time must be before end date/time
                  </p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={handleCustomCancel}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleCustomConfirm}
                isDisabled={!isValidCustomRange}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
}
