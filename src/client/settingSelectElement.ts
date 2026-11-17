export interface SettingBinding {
  current(): string;
  choose(value: string): void;
}

export function defineSettingSelect(tag: string, binding: SettingBinding): void {
  class SettingSelectElement extends HTMLElement {
    connectedCallback(): void {
      const select = this.shadowRoot?.querySelector('select');
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }
      select.value = binding.current();
      select.addEventListener('change', () => {
        binding.choose(select.value);
      });
    }
  }

  customElements.define(tag, SettingSelectElement);
}
