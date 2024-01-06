import { Injectable } from '@angular/core';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage/ngx';
import { ScoutingForm, ScoutingFormType } from '../../models/scouting-form.model';

const STORAGE_KEY = 'scouting-forms';

@Injectable({
  providedIn: 'root',
})
export class ScoutingFormService {
  constructor(private storage: KeyValueStorage) {}

  async addOrUpdateForm(form: ScoutingForm) {
    const forms = await this.getForms();
    const index = forms.findIndex((f) => f.id === form.id);

    if (index !== -1) {
      return this.updateForm(form);
    } else {
      return this.addForm(form);
    }
  }

  async addForm(form: ScoutingForm) {
    if (form.isDefault) await this.clearDefault(form.type);
    const forms = await this.getForms();
    forms.push({ ...form, id: Date.now().toString() });
    return this.storage.set(STORAGE_KEY, forms);
  }

  async updateForm(form: ScoutingForm) {
    if (form.isDefault) await this.clearDefault(form.type);
    const forms = await this.getForms();
    const index = forms.findIndex((f) => f.id === form.id);
    forms[index] = form;
    return this.storage.set(STORAGE_KEY, forms);
  }

  async getForms(): Promise<ScoutingForm[]> {
    try {
      await this.storage.create('totally_secure_encryption_key');
    } catch (e) {}
    const forms = await this.storage.get(STORAGE_KEY);
    if (forms) return forms;
    else return [];
  }

  async clearDefault(matchType: ScoutingFormType): Promise<any> {
    const forms = await this.getForms();
    return Promise.all(
      forms
        .filter((f) => f.type === matchType)
        .map((f) => ({ ...f, isDefault: false }))
        .map((f) => this.updateForm(f))
    );
  }
}
