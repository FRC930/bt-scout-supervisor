import { IonText } from '@ionic/angular';
import { ButtonMetricComponent } from '../../components/button-metric/button-metric.component';
import { DropdownMetricComponent } from '../../components/dropdown-metric/dropdown-metric.component';
import { MetricType, MetricValueMap } from '../../shared/models/metric.model';

export interface MetricBuilder {
  id: string;
  type: MetricType;
  component: any;
  inputs: {
    params?: any;
    valueMap?: MetricValueMap;
    inBuilder?: boolean;
  };
}

export const MetricBuilderList: MetricBuilder[] = [
  {
    id: '0',
    type: MetricType.Button,
    component: ButtonMetricComponent,
    inputs: {
      params: {
        id: 'button-1',
        buttonText: 'Counter',
      },
    },
  },
  {
    id: '1',
    type: MetricType.Dropdown,
    component: DropdownMetricComponent,
    inputs: {
      params: {
        id: 'dropdown-1',
        buttonText: 'Dropdown',
        options: ['Option 1', 'Option 2', 'Option 3'],
      },
    },
  },
];
