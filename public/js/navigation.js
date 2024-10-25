"use strict";
class Navigation {
    constructor() {
        this.elements = {
            menuButton: document.querySelector('button[aria-label="Toggle menu"]'),
            mobileMenu: document.getElementById('mobile-menu')
        };
        this.init();
    }
    init() {
        if (!this.elements.menuButton || !this.elements.mobileMenu) {
            console.error('Required navigation elements not found');
            return;
        }
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.elements.menuButton?.addEventListener('click', this.toggleMenu.bind(this));
        document.addEventListener('click', this.handleClickOutside.bind(this));
    }
    toggleMenu() {
        if (!this.elements.menuButton || !this.elements.mobileMenu)
            return;
        const isExpanded = this.elements.menuButton.getAttribute('aria-expanded') === 'true';
        this.elements.menuButton.setAttribute('aria-expanded', (!isExpanded).toString());
        this.elements.mobileMenu.classList.toggle('hidden');
    }
    handleClickOutside(event) {
        if (!this.elements.menuButton || !this.elements.mobileMenu)
            return;
        const target = event.target;
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
