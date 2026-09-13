import { setLocationHash } from "./locationHash";

export const PANEL_MODAL_EVENT = "alps:open-panel";
export type PanelId = "friday" | "saturday";

export function getPanelModalId(panel: PanelId) {
  return `panel-${panel}`;
}

export function openPanelModal(panel: PanelId) {
  const panelId = getPanelModalId(panel);
  setLocationHash(panelId);
  window.dispatchEvent(
    new CustomEvent<{ panelId: string }>(PANEL_MODAL_EVENT, {
      detail: { panelId },
    })
  );
}
