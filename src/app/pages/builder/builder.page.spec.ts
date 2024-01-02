import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuilderPage } from './builder.page';

describe('BuilderPage', () => {
  let component: BuilderPage;
  let fixture: ComponentFixture<BuilderPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BuilderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
