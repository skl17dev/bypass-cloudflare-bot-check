export { };

declare global {
  interface Element {
    _shadowRoot?: ShadowRoot;
  }
}