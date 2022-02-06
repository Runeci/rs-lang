interface MenuSection {
  readonly className: string;
  readonly text: string;
  readonly iconClass: string;
}

export class MenuAside {
  public drawMenuAside(): void {
    const wrapper = document.querySelector('.wrapper') as HTMLBodyElement;
    const menuAside = this.createMenuAsise();

    wrapper.append(menuAside);
    this.toggleBurgerMenu();
    this.createGamesDropdown();
  }

  private closeMenuAside(): void {
    const menu = document.querySelector('.menu-aside') as HTMLElement;
    const menuGames = document.querySelector('.menu-games') as HTMLElement;

    const overlay = document.querySelector('.overlay') as HTMLElement;

    menu.classList.remove('open');
    menuGames.classList.remove('active');
    overlay.remove();
  }

  private toggleBurgerMenu(): void {
    const body = document.querySelector('body') as HTMLBodyElement;
    const menuBtn = document.querySelector('.menu-btn') as HTMLElement;
    const menu = document.querySelector('.menu-aside') as HTMLElement;
    const overlay = this.createOverlay();
    const menuBtns = document.getElementsByClassName('menu-item') as HTMLCollectionOf<HTMLButtonElement>;
    // const dropdown = document.querySelector('.dropdown') as HTMLElement;

    menuBtn.addEventListener('click', () => {
      menu.classList.add('open');
      body.prepend(overlay);
    });

    [overlay, ...menuBtns].forEach((btn) => {
      if (btn.dataset.route === 'games') {
        return;
      }
      btn.addEventListener('click', () => this.closeMenuAside());
    });
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div') as HTMLElement;
    overlay.classList.add('overlay');
    return overlay;
  }

  private createMenuAsise(): HTMLElement {
    const menu = document.createElement('aside') as HTMLElement;
    menu.classList.add('menu-aside');

    const sections: MenuSection[] = [
      { className: 'book', iconClass: 'book', text: 'учебник' },
      { className: 'vocabulary', iconClass: 'book-reader', text: 'словарь' },
      { className: 'games', iconClass: 'gamepad', text: 'игры' },
      { className: 'stats', iconClass: 'signal', text: 'статистика' },
      { className: 'team', iconClass: 'user-friends', text: 'о команде' },
      { className: 'overview', iconClass: 'film', text: 'обзор' },
    ];

    let content = '';
    sections.forEach((item) => {
      content += `<button class="menu-${item.className} menu-item" data-route="${item.className}">
                    <i class="fas fa-${item.iconClass} menu-icon" data-route="${item.className}"></i>
                    <div class="menu-text" data-route="${item.className}">${item.text}</div>
                  </button>`;
    });
    menu.innerHTML = content;
    return menu;
  }

  private createGamesDropdown(): void {
    const container = document.querySelector('.menu-games') as HTMLElement;
    container.classList.add('wrapper-dropdown');
    const ul = document.createElement('ul') as HTMLUListElement;
    ul.classList.add('dropdown');
    ul.innerHTML = `<li><div class="audiocall" data-route="audiocall">Аудиовызов</div></li>
                    <li><div class="sprint page-btn"  data-route="sprint">Спринт</div></li>`;

    container.addEventListener('click', () => {
      container.classList.toggle('active');
    });
    ul.addEventListener('click', () => {
      this.closeMenuAside();
      container.classList.toggle('active');
    });
    container.append(ul);
  }
}