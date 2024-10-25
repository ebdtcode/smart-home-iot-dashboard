interface NavigationElements {
    menuButton: HTMLButtonElement | null;
    mobileMenu: HTMLElement | null;
}
declare class Navigation {
    private elements;
    constructor();
    private init;
    private setupEventListeners;
    private toggleMenu;
    private handleClickOutside;
}
