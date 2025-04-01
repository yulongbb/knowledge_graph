import { Injectable, Type, ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentFactory } from '@angular/core';

export class DialogRef<T> {
  constructor(private componentRef: ComponentRef<T>) {}

  close(result?: any) {
    this.componentRef.destroy();
  }
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogContainer: HTMLElement;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.dialogContainer = document.createElement('div');
    document.body.appendChild(this.dialogContainer);
  }

  open<T>(component: Type<T>, config: { width?: string; data?: any } = {}): DialogRef<T> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef:any = componentFactory.create(this.injector);
    
    Object.assign(componentRef.instance, { data: config.data });
    
    this.appRef.attachView(componentRef.hostView);
    
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
    if (config.width) {
      domElem.style.width = config.width;
    }
    
    this.dialogContainer.appendChild(domElem);
    
    return new DialogRef(componentRef);
  }
}

export const DIALOG_DATA = 'DIALOG_DATA';
