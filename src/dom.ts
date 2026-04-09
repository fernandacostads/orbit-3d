export type Nullable<T> = T | null;

export const getElement = <T extends HTMLElement = HTMLElement>(
  selector: string,
): T => {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Unable to find element matching selector: ${selector}`);
  }

  return element;
};

export const queryAll = <T extends Element = Element>(
  selector: string,
): NodeListOf<T> => document.querySelectorAll<T>(selector);

export const delegate = <T extends Element>(
  root: Element,
  selector: string,
  eventType: keyof HTMLElementEventMap,
  handler: (event: Event & { delegateTarget: T }) => void,
): void => {
  root.addEventListener(eventType, (event) => {
    const target = (event.target as Element | null)?.closest(
      selector,
    ) as T | null;

    if (!target) {
      return;
    }

    handler(Object.assign(event, { delegateTarget: target }));
  });
};
