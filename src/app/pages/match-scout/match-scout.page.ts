import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ScoutingForm, ScoutingFormType } from '../../shared/models/scouting-form.model';
import { ButtonMetricComponent } from '../../components/button-metric/button-metric.component';
import { DropdownMetricComponent } from '../../components/dropdown-metric/dropdown-metric.component';
import { MetricType, MetricValueMap } from '../../shared/models/metric.model';
import { ScoutingFormService } from '../../shared/db/scouting-form.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-match-scout',
  templateUrl: './match-scout.page.html',
  styleUrls: ['./match-scout.page.scss'],
})
export class MatchScoutPage implements OnInit {
  private closeSubRef: Subject<any> = new Subject();

  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  private valueMap: MetricValueMap = {};

  constructor(private formService: ScoutingFormService) {}

  async ngOnInit() {
    const forms = await this.formService.getForms();
    const form = forms.find((f) => (ScoutingFormType[f.type] as any) === ScoutingFormType.Match && f.isDefault) || forms[0];
    if (form) this.transformScoutingForm(form);
  }

  componentFromMetricType(type: MetricType): any {
    switch (type) {
      case MetricType.Button:
        return ButtonMetricComponent;
      case MetricType.Dropdown:
        return DropdownMetricComponent;
    }
  }

  transformScoutingForm(form: ScoutingForm) {
    return form.metrics.map((metric) => {
      const component = this.componentFromMetricType(metric.type);

      const viewContainerRef = this.container.createComponent(component) as any;
      viewContainerRef.instance.params = metric.params;
      viewContainerRef.instance.valueMap = this.valueMap;
      viewContainerRef.instance.metricUpdated.pipe(takeUntil(this.closeSubRef)).subscribe((event: MetricValueMap) => {
        this.valueMap = { ...this.valueMap, ...event };
      });
    });
  }
}
