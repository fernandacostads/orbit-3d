import { delegate, getElement, queryAll } from "./dom";

const enum BodyClass {
  Opening = "opening",
  HideUI = "hide-UI",
  View2D = "view-2D",
  View3D = "view-3D",
  DataOpen = "data-open",
  DataClose = "data-close",
  ControlsOpen = "controls-open",
  ControlsClose = "controls-close",
  ZoomLarge = "zoom-large",
  ZoomClose = "zoom-close",
  SetSpeed = "set-speed",
  SetSize = "set-size",
  SetDistance = "set-distance",
  SetFacts = "set-facts",
}

const enum ScaleMode {
  Speed = "scale-stretched",
  Size = "scale-s",
  Distance = "scale-d",
}

const planetClasses = new Set([
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
]);

export class SolarSystemApp {
  private readonly body = document.body;
  private readonly universe = getElement<HTMLElement>("#universe");
  private readonly solarSystem = getElement<HTMLElement>("#solar-system");
  private readonly dataLinks = queryAll<HTMLAnchorElement>("#data a");
  private readonly toggleData = getElement<HTMLAnchorElement>("#toggle-data");
  private readonly toggleControls =
    getElement<HTMLAnchorElement>("#toggle-controls");
  private readonly controls = getElement<HTMLElement>("#controls");
  private readonly dataSection = getElement<HTMLElement>("#data");

  public start(): void {
    this.initializeView();
    this.bindEvents();
  }

  private initializeView(): void {
    this.body.classList.remove(BodyClass.View2D, BodyClass.Opening);
    this.body.classList.add(BodyClass.View3D);
    this.universe.classList.add(ScaleMode.Speed);

    window.setTimeout(() => {
      this.body.classList.remove(BodyClass.HideUI);
      this.body.classList.add(BodyClass.SetSpeed);
    }, 2000);
  }

  private bindEvents(): void {
    this.toggleData.addEventListener("click", this.handleToggleData);
    this.toggleControls.addEventListener("click", this.handleToggleControls);
    delegate<HTMLAnchorElement>(
      this.dataSection,
      "a",
      "click",
      this.handlePlanetSelection,
    );
    this.controls.addEventListener("click", this.handleControlClick);
  }

  private handleToggleData = (event: MouseEvent): void => {
    event.preventDefault();
    this.toggleBodyClassPair(BodyClass.DataOpen, BodyClass.DataClose);
  };

  private handleToggleControls = (event: MouseEvent): void => {
    event.preventDefault();
    this.toggleBodyClassPair(BodyClass.ControlsOpen, BodyClass.ControlsClose);
  };

  private handlePlanetSelection = (
    event: Event & { delegateTarget: HTMLAnchorElement },
  ): void => {
    event.preventDefault();

    const target = event.delegateTarget;
    const planetClass = this.getPlanetClassFromAnchor(target);

    if (!planetClass) {
      return;
    }

    this.solarSystem.className = planetClass;
    this.updateActivePlanet(target);
  };

  private handleControlClick = (event: MouseEvent): void => {
    const target = (event.target as Element).closest("label");

    if (!target) {
      return;
    }

    if (target.classList.contains("set-view")) {
      this.toggleBodyClassPair(BodyClass.View3D, BodyClass.View2D);
      return;
    }

    if (target.classList.contains("set-zoom")) {
      this.toggleBodyClassPair(BodyClass.ZoomLarge, BodyClass.ZoomClose);
      return;
    }

    if (target.classList.contains("set-speed")) {
      this.setScaleMode(ScaleMode.Speed, BodyClass.SetSpeed);
      return;
    }

    if (target.classList.contains("set-size")) {
      this.setScaleMode(ScaleMode.Size, BodyClass.SetSize);
      return;
    }

    if (target.classList.contains("set-distance")) {
      this.setScaleMode(ScaleMode.Distance, BodyClass.SetDistance);
      return;
    }

    if (target.classList.contains("set-facts")) {
      this.setInfoMode(BodyClass.SetFacts);
    }
  };

  private setScaleMode(scaleClass: ScaleMode, bodyClass: BodyClass): void {
    this.universe.className = scaleClass;
    this.updateBodyScaleClass(bodyClass);
  }

  private setInfoMode(bodyClass: BodyClass): void {
    this.updateBodyScaleClass(bodyClass);
  }

  private getActivePlanetClass(): string | undefined {
    return this.solarSystem.className
      .split(" ")
      .find((className) => planetClasses.has(className));
  }

  private updateBodyScaleClass(bodyClass: BodyClass): void {
    this.body.classList.remove(
      BodyClass.SetSpeed,
      BodyClass.SetSize,
      BodyClass.SetDistance,
      BodyClass.SetFacts,
    );
    this.body.classList.add(bodyClass);
  }

  private toggleBodyClassPair(
    firstClass: BodyClass,
    secondClass: BodyClass,
  ): void {
    if (this.body.classList.contains(firstClass)) {
      this.body.classList.replace(firstClass, secondClass);
    } else if (this.body.classList.contains(secondClass)) {
      this.body.classList.replace(secondClass, firstClass);
    } else {
      this.body.classList.add(firstClass);
    }
  }

  private getPlanetClassFromAnchor(
    target: HTMLAnchorElement,
  ): string | undefined {
    return target.className
      .split(" ")
      .find((className) => planetClasses.has(className));
  }

  private getCurrentScaleClass(): string | undefined {
    const scaleClasses = [ScaleMode.Speed, ScaleMode.Size, ScaleMode.Distance];

    return this.universe.className
      .split(" ")
      .find((className) => scaleClasses.includes(className as ScaleMode));
  }

  private updateActivePlanet(activeLink: HTMLAnchorElement): void {
    this.dataLinks.forEach((link) =>
      link.classList.toggle("active", link === activeLink),
    );
  }
}
