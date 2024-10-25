interface NavigationElements {
  menuButton: HTMLButtonElement | null;
  mobileMenu: HTMLElement | null;
}

class Navigation {
  private elements: NavigationElements;

  constructor() {
    this.elements = {
      menuButton: document.querySelector<HTMLButtonElement>('button[aria-label="Toggle menu"]'),
      mobileMenu: document.getElementById('mobile-menu')
    };

    this.init();
  }

  private init(): void {
    if (!this.elements.menuButton || !this.elements.mobileMenu) {
      console.error('Required navigation elements not found');
      return;
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.elements.menuButton?.addEventListener('click', this.toggleMenu.bind(this));
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private toggleMenu(): void {
    if (!this.elements.menuButton || !this.elements.mobileMenu) return;

    const isExpanded = this.elements.menuButton.getAttribute('aria-expanded') === 'true';
    this.elements.menuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    this.elements.mobileMenu.classList.toggle('hidden');
  }

  private handleClickOutside(event: MouseEvent): void {
    if (!this.elements.menuButton || !this.elements.mobileMenu) return;

    const target = event.target as Node;
    if (!this.elements.menuButton.contains(target) && !this.elements.mobileMenu.contains(target)) {
      this.elements.mobileMenu.classList.add('hidden');
      this.elements.menuButton.setAttribute('aria-expanded', 'false');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});
