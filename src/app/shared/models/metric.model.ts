export enum MetricType {
  Button,
  Dropdown,
  Toggle,
}

export interface Metric {
  type: MetricType;
  params: MetricParams;
  order: number;
}

export interface MetricParams {
  id: string;
  name: string;
}

export interface MetricValueMap {
  [key: string]: any;
}
