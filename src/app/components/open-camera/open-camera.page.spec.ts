import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCameraPage } from './open-camera.page';

describe('OpenCameraPage', () => {
  let component: OpenCameraPage;
  let fixture: ComponentFixture<OpenCameraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCameraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
