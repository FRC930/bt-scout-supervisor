import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonMetricParams } from 'src/app/components/button-metric/button-metric.model';
import { MetricBuilder, MetricBuilderList } from 'src/app/pages/builder/builder.model';
import { DropdownMetricParams } from '../../components/dropdown-metric/dropdown-metric.model';
import { Metric, MetricType, MetricValueMap } from '../../shared/models/metric.model';
import { ScoutingForm, ScoutingFormType } from '../../shared/models/scouting-form.model';
import { IonModal, MenuController } from '@ionic/angular';
import { ScoutingFormService } from '../../shared/db/scouting-form.service';
import { ButtonMetricComponent } from '../../components/button-metric/button-metric.component';
import { DropdownMetricComponent } from '../../components/dropdown-metric/dropdown-metric.component';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.page.html',
  styleUrls: ['./builder.page.scss'],
})
export class BuilderPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  menu: MetricBuilder[] = [];

  valueMap: MetricValueMap = {};

  params1: ButtonMetricParams = { buttonText: 'Button 1', id: 'button-1', name: 'Button 1' };
  params2: ButtonMetricParams = { buttonText: 'Button 2', id: 'button-2', name: 'Button 2' };
  params3: DropdownMetricParams = { buttonText: 'Dropdown', id: 'dropdown-2', name: 'Button 2', options: ['top', 'middle', 'bottom'] };

  name: string = '';
  type: ScoutingFormType = ScoutingFormType.Match;
  isDefault: boolean = false;
  types = Object.keys(ScoutingFormType).filter((v) => isNaN(Number(v)));
  showModal = false;

  scoutingForms: ScoutingForm[] = [];
  selectedForm: ScoutingForm = {
    name: 'New Form',
    id: '',
    type: ScoutingFormType.Match,
    metrics: [],
    isDefault: false,
  } as ScoutingForm;

  selectedMetricBuilder: MetricBuilder[] = [];

  constructor(private formService: ScoutingFormService, private menuController: MenuController) {}

  async ngOnInit() {
    this.menu = MetricBuilderList;
    this.scoutingForms = await this.formService.getForms();
    this.selectedForm = this.scoutingForms.length > 0 ? this.scoutingForms[0] : this.selectedForm;
    this.selectForm(this.selectedForm);
  }

  selectForm(form: ScoutingForm) {
    this.selectedForm = form;
    this.name = form.name;
    this.type = form.type;
    this.isDefault = form.isDefault;
    this.selectedMetricBuilder = this.transformScoutingForm(form);
    this.menuController.close();
  }

  createNewForm() {
    this.selectForm({
      name: 'New Form',
      id: '',
      type: ScoutingFormType.Match,
      metrics: [],
      isDefault: false,
    });
  }

  componentFromMetricType(type: MetricType): any {
    switch (type) {
      case MetricType.Button:
        return ButtonMetricComponent;
      case MetricType.Dropdown:
        return DropdownMetricComponent;
    }
  }

  transformScoutingForm(form: ScoutingForm): MetricBuilder[] {
    return form.metrics.map((metric) => {
      const component = this.componentFromMetricType(metric.type);

      return {
        id: form.id,
        component: component,
        type: metric.type,
        inputs: {
          params: metric.params,
          inBuilder: true,
        },
      } as MetricBuilder;
    });
  }

  drop(event: any) {
    if (event.previousContainer !== event.container) {
      const to = this.clamp(event.currentIndex, event.container.data.length);

      const newValue: MetricBuilder = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      newValue.inputs = { ...newValue.inputs, inBuilder: true };
      newValue.id = `button-${this.selectedMetricBuilder.length + 1}`;
      newValue.component = this.componentFromMetricType(newValue.type);

      if (event.previousContainer.data.length) {
        event.container.data.splice(to, 0, newValue);
      }
    } else {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }

    if (event.previousContainer.data) {
      this.menu = this.menu.filter((f: any) => !f.temp);
    }
  }

  clamp(value: number, max: number): number {
    return Math.max(0, Math.min(max, value));
  }

  exited(event: any) {
    const currentIdx = event.container.data.findIndex((f: any) => f.id === event.item.data.id);
    this.menu.splice(currentIdx + 1, 0, {
      ...event.item.data,
      temp: true,
    });
  }

  entered() {
    this.menu = this.menu.filter((f: any) => !f.temp);
  }

  echo(metric: MetricValueMap) {
    this.valueMap = { ...this.valueMap, ...metric };
  }

  presentSaveModal() {
    this.modal.present();
  }

  async save() {
    this.modal.dismiss();
    const metrics = this.selectedMetricBuilder.map((component, index) => {
      return {
        type: component.type,
        id: component.id,
        params: component.inputs.params,
        order: index,
      } as Metric;
    });

    if (this.selectedForm) {
      this.selectedForm = {
        ...this.selectedForm,
        name: this.name,
        type: this.type,
        isDefault: this.isDefault,
        metrics: metrics,
      };
      await this.formService.addOrUpdateForm(this.selectedForm);
      this.scoutingForms = await this.formService.getForms();
    }
  }
}
