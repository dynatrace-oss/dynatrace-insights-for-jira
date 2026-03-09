import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

// Register ECharts components for tree-shaking
echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  SVGRenderer
]);

export { echarts };
