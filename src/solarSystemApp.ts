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

type Locale = "en" | "pt" | "es";

const translations: Record<
  Locale,
  {
    lang: string;
    title: string;
    toggleData: string;
    toggleControls: string;
    scaleSpeed: string;
    scaleSize: string;
    scaleDistance: string;
    scaleFacts: string;
    planets: Record<string, string>;
  }
> = {
  en: {
    lang: "en",
    title: "Orbit 3D",
    toggleData: "Data",
    toggleControls: "Controls",
    scaleSpeed: "Speed",
    scaleSize: "Size",
    scaleDistance: "Distance",
    scaleFacts: "Facts",
    planets: {
      sun: "Sun",
      mercury: "Mercury",
      venus: "Venus",
      earth: "Earth",
      mars: "Mars",
      jupiter: "Jupiter",
      saturn: "Saturn",
      uranus: "Uranus",
      neptune: "Neptune",
    },
  },
  pt: {
    lang: "pt-BR",
    title: "Orbit 3D",
    toggleData: "Dados",
    toggleControls: "Controles",
    scaleSpeed: "Velocidade",
    scaleSize: "Tamanho",
    scaleDistance: "Distância",
    scaleFacts: "Fatos",
    planets: {
      sun: "Sol",
      mercury: "Mercúrio",
      venus: "Vênus",
      earth: "Terra",
      mars: "Marte",
      jupiter: "Júpiter",
      saturn: "Saturno",
      uranus: "Urano",
      neptune: "Netuno",
    },
  },
  es: {
    lang: "es",
    title: "Orbit 3D",
    toggleData: "Datos",
    toggleControls: "Controles",
    scaleSpeed: "Velocidad",
    scaleSize: "Tamaño",
    scaleDistance: "Distancia",
    scaleFacts: "Hechos",
    planets: {
      sun: "Sol",
      mercury: "Mercurio",
      venus: "Venus",
      earth: "Tierra",
      mars: "Marte",
      jupiter: "Júpiter",
      saturn: "Saturno",
      uranus: "Urano",
      neptune: "Neptuno",
    },
  },
};

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
  private readonly html = document.documentElement;
  private readonly universe = getElement<HTMLElement>("#universe");
  private readonly solarSystem = getElement<HTMLElement>("#solar-system");
  private readonly languageSelect =
    getElement<HTMLSelectElement>("#language-select");
  private readonly dataLinks = queryAll<HTMLAnchorElement>("#data a");
  private readonly toggleData = getElement<HTMLAnchorElement>("#toggle-data");
  private readonly toggleControls =
    getElement<HTMLAnchorElement>("#toggle-controls");
  private readonly controls = getElement<HTMLElement>("#controls");
  private readonly dataSection = getElement<HTMLElement>("#data");

  public start(): void {
    this.initializeView();
    this.bindEvents();
    this.applyLocale(this.languageSelect.value as Locale);
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
    this.languageSelect.addEventListener("change", this.handleLanguageChange);
    delegate<HTMLAnchorElement>(
      this.dataSection,
      "a",
      "click",
      this.handlePlanetSelection,
    );
    this.controls.addEventListener("click", this.handleControlClick);
  }

  private handleLanguageChange = (event: Event): void => {
    const locale = (event.target as HTMLSelectElement).value as Locale;
    this.applyLocale(locale);
  };

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

  private applyLocale(locale: Locale): void {
    const translation = translations[locale];

    this.html.lang = translation.lang;
    document.title = translation.title;

    const toggleDataLabel = this.toggleData.querySelector("span");
    const toggleControlsLabel = this.toggleControls.querySelector("span");

    if (toggleDataLabel) {
      toggleDataLabel.textContent = translation.toggleData;
    }

    if (toggleControlsLabel) {
      toggleControlsLabel.textContent = translation.toggleControls;
    }

    const speedLabel = this.controls.querySelector(
      ".set-speed span",
    ) as HTMLSpanElement | null;
    const sizeLabel = this.controls.querySelector(
      ".set-size span",
    ) as HTMLSpanElement | null;
    const distanceLabel = this.controls.querySelector(
      ".set-distance span",
    ) as HTMLSpanElement | null;
    const factsLabel = this.controls.querySelector(
      ".set-facts span",
    ) as HTMLSpanElement | null;

    if (speedLabel) {
      speedLabel.textContent = translation.scaleSpeed;
    }

    if (sizeLabel) {
      sizeLabel.textContent = translation.scaleSize;
    }

    if (distanceLabel) {
      distanceLabel.textContent = translation.scaleDistance;
    }

    if (factsLabel) {
      factsLabel.textContent = translation.scaleFacts;
    }

    this.dataLinks.forEach((link) => {
      const planet = this.getPlanetClassFromAnchor(link);

      if (planet) {
        link.textContent = translation.planets[planet];
        link.title = translation.planets[planet];
      }
    });

    planetClasses.forEach((planet) => {
      const target = document.querySelector<HTMLElement>(`#${planet}`);
      const heading = target?.querySelector("dt");

      if (heading && translation.planets[planet]) {
        heading.textContent = translation.planets[planet];
      }
    });
  }
}
