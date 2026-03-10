import Button from '@atlaskit/button/new';
import type { ChartType } from '../../types/issue-config';

interface ChartTypeSelectorProps {
  selectedType: ChartType
  onTypeChange: (type: ChartType) => void
}

export function ChartTypeSelector({ selectedType, onTypeChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onTypeChange('line')}
        spacing="compact"
        isSelected={selectedType === 'line'}
      >
        Line Chart
      </Button>
      <Button
        onClick={() => onTypeChange('bar')}
        spacing="compact"
        isSelected={selectedType === 'bar'}
      >
        Bar Chart
      </Button>
    </div>
  );
}
