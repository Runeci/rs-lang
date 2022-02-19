import { ControllerUserWords } from '../../common/controller/controllerUserWords';
import { TemplateHtmlAudioGame } from './templateHtmlAudioGame';
import { AudioGameSound } from './audioGameSound';
import { AudioGameResultCard } from './audioGameResultCard';
import { IWordsData } from '../../common/controller/model';
import { HelpersAudioGame } from './helpersAudioGame';
import { ControllerWords } from '../../common/controller/controllerWords';
import { ResultType } from '../model';
import { StartGame } from '../../common/startGames/startGames';

type OptionsType = Pick<IWordsData, 'id' | 'word'>;
enum KeyCode {
  BUTTON_ONE = 'Digit1',
  BUTTON_TWO = 'Digit2',
  BUTTON_THREE = 'Digit3',
  BUTTON_FOUR = 'Digit4',
  BUTTON_FIVE = 'Digit5',
  BUTTON_SPACE = 'Space',
  BUTTON_ENTER = 'Enter',
}

const gameTitle = 'Аудио вызов';
const gameDescription = `Проверьте свои навыки слушания,
  пытаясь подобрать правильное значение после услышанного слова`;

export class AudioGamePage {
  private pageContainer;

  private activeWordIndex = 0;

  private totalPage = 30;

  private totalWord = 20;

  private activeGroup = 0;

  private url = 'https://rs-lang-2022.herokuapp.com/';

  private isAnswer = false;

  public correctAnswer: ResultType[] = [];

  public incorrectAnswer: ResultType[] = [];

  private words: IWordsData[] = [];

  private controller = new ControllerWords();

  private helpers = new HelpersAudioGame();

  private resultCard: AudioGameResultCard;

  private soundGame = new AudioGameSound();

  private templateAudioGame = new TemplateHtmlAudioGame();

  private controllerUserWords = new ControllerUserWords();

  private start = new StartGame((group) => this.startCallback(group), gameTitle, gameDescription);

  constructor() {
    this.resultCard = new AudioGameResultCard(() => this.startNewGame());
    this.pageContainer = document.querySelector('body') as HTMLBodyElement;
  }

  public draw(): void {
    const main = document.querySelector('main') as HTMLElement;
    main.innerHTML = '';
    const mainWrapper = document.createElement('div') as HTMLDivElement;
    mainWrapper.classList.add('main-wrapper-audio-game-page');

    main.prepend(mainWrapper);
    this.start.showGameSetting(mainWrapper);
    this.soundGame.createSoundButton();
  }

  private startCallback(group: number): void {
    this.activeGroup = group;
    this.startNewGame();
  }

  private startNewGame(): void {
    this.resetGame();
    const pageNumber = this.helpers.getRandomInt(0, this.totalPage);
    this.controller
      .getWords(this.activeGroup, pageNumber)
      .then((data) => {
        this.words = this.helpers.shuffleArray(data);
        this.activeWordIndex = 0;
        this.drawGameCard();
        document.removeEventListener('keydown', this.handleKeyboardEvent);
        document.addEventListener('keydown', this.handleKeyboardEvent);
      });
  }

  private resetGame(): void {
    this.correctAnswer = [];
    this.incorrectAnswer = [];
    this.words = [];
    this.activeWordIndex = 0;
  }

  private setGameCardListener(): void {
    const container = document.querySelector('.main-wrapper-audio-game') as HTMLDivElement;
    container?.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isOption = target.classList.contains('button-word-audio-game');

      if (isOption) {
        this.handleButton(target as HTMLButtonElement);
      }

      if (this.activeWordIndex === this.totalWord) {
        this.resultCard.createResultGameCard(this.correctAnswer, this.incorrectAnswer);
      }
    });
  }

  private handleButton(button: HTMLButtonElement): void {
    const { id } = button.dataset;
    const activeWord = this.words[this.activeWordIndex];
    const isCorrect = activeWord.id === id;

    if (isCorrect) {
      button.classList.add('correct');
      this.correctAnswer.push(this.words[this.activeWordIndex]);
      this.soundGame.playSoundCorrectAnswer();
      this.checkWordForSend(activeWord.id, true);
    } else {
      button.classList.add('incorrect');
      this.incorrectAnswer.push(this.words[this.activeWordIndex]);
      const correctButton = document.querySelector(`[data-id='${activeWord.id}']`) as HTMLElement;
      correctButton.classList.add('correct');
      this.soundGame.playSoundIncorrectAnswer();
      this.checkWordForSend(activeWord.id, false);
    }
    this.createAnswer();
  }

  private checkWordForSend(wordId: string, isCorrect: boolean): void {
    const userId = localStorage.getItem('user_id') || '';
    const token = localStorage.getItem('user_access_token') || '';
    const delta: number = isCorrect ? 1 : -1;
    this.controllerUserWords.getUserWord(userId, token, wordId).then((data) => {
      this.controllerUserWords.updateUserWord(userId, token, wordId, {
        difficulty: data.difficulty,
        optional: {
          new: data.optional.new,
          progress: data.optional.progress + delta,
        },
      });
    }).catch(() => this.controllerUserWords.createUserWord(userId, token, wordId, {
      difficulty: 'simple',
      optional: {
        new: false,
        progress: 0,
      },
    }));
  }

  private createAnswer(): void {
    this.isAnswer = true;
    const options = document.querySelectorAll('.button-word-audio-game') as NodeListOf<HTMLButtonElement>;
    options.forEach((option) => {
      // need disable button
      // eslint-disable-next-line no-param-reassign
      option.disabled = true;
    });
    const container = document.querySelector('.answer-info-container') as HTMLDivElement;
    const img = document.createElement('img') as HTMLImageElement;
    const p = document.createElement('p') as HTMLSpanElement;
    img.classList.add('img-answer');
    img.src = this.url + this.words[this.activeWordIndex].image as string;
    p.classList.add('answer-text');
    p.innerText = this.words[this.activeWordIndex].word as string;
    container.appendChild(img);
    container.appendChild(p);
    const buttonAnswer = this.pageContainer.querySelector('.button-answer-audio-game') as HTMLButtonElement;
    const buttonNext = this.pageContainer.querySelector('.button-next-card-audio-game') as HTMLButtonElement;
    buttonAnswer.style.display = 'none';
    buttonNext.style.display = 'inline-block';
  }

  private drawNextCard(): void {
    this.isAnswer = false;
    const buttonAnswer = this.pageContainer.querySelector('.button-answer-audio-game') as HTMLButtonElement;
    const buttonNext = this.pageContainer.querySelector('.button-next-card-audio-game') as HTMLButtonElement;

    buttonAnswer?.addEventListener('click', () => {
      this.incorrectAnswer.push(this.words[this.activeWordIndex]);

      const activeWord = this.words[this.activeWordIndex];
      const id = activeWord.id as string;
      const activeButton = document.querySelector(`.button-word-audio-game[data-id='${id}']`);

      if (activeButton !== null) {
        activeButton.classList.add('correct');
      }
      buttonAnswer.style.display = 'none';
      buttonNext.style.display = 'inline-block';
      this.soundGame.playSoundIncorrectAnswer();
      this.createAnswer();
    });
    buttonNext.addEventListener('click', () => {
      if (this.activeWordIndex < this.totalWord - 1) {
        buttonNext.style.display = 'none';
        buttonAnswer.style.display = 'inline-block';
        this.activeWordIndex += 1;
        this.drawGameCard();
      } else {
        this.resultCard.createResultGameCard(this.correctAnswer, this.incorrectAnswer);
      }
    });
  }

  private startAudio(word: IWordsData): void {
    const audio = new Audio(this.url + word.audio);
    audio.play();
    const containerResult = document.querySelector('.container-result-info-audio-game');
    if (containerResult !== null) {
      audio.pause();
    }
  }

  private drawGameCard(): void {
    const activeWord = this.words[this.activeWordIndex];
    const options = this.generateOptions(activeWord);
    this.startAudio(activeWord);
    this.createButtonsWithAnswer(options);
    const container = this.pageContainer.querySelector('.main-wrapper-audio-game-page') as HTMLDivElement;
    container.style.boxShadow = 'none';
    const buttonVolume = this.pageContainer.querySelector('.button-volume-audio-game') as HTMLButtonElement;
    buttonVolume.addEventListener('click', () => {
      this.startAudio(activeWord);
    });
  }

  private handleKeyboardEvent = (e: KeyboardEvent): void => {
    this.handleEnterButton(e);
    this.handleSpaceButton(e);
    this.handleDigitsButtons(e);
  };

  private handleEnterButton = (e: KeyboardEvent): void => {
    const buttonAnswer = this.pageContainer.querySelector('.button-answer-audio-game') as HTMLButtonElement;
    const buttonNext = this.pageContainer.querySelector('.button-next-card-audio-game') as HTMLButtonElement;

    if (e.code === KeyCode.BUTTON_ENTER) {
      const isLastWord = this.activeWordIndex + 1 === this.totalWord;
      const activeWord = this.words[this.activeWordIndex];

      if (!this.isAnswer) {
        this.incorrectAnswer.push(activeWord);
        buttonAnswer.style.display = 'none';
        buttonNext.style.display = 'inline-block';
        const id = activeWord.id as string;
        const activeButton = document.querySelector(`.button-word-audio-game[data-id='${id}']`);

        if (activeButton !== null) {
          activeButton.classList.add('correct');
        }
        this.soundGame.playSoundIncorrectAnswer();
        this.createAnswer();
        this.checkWordForSend(activeWord.id, false);
      } else if (!isLastWord) {
        buttonAnswer.style.display = 'inline-block';
        buttonNext.style.display = 'none';
        this.activeWordIndex += 1;
        this.drawGameCard();
      } else {
        this.resultCard.createResultGameCard(this.correctAnswer, this.incorrectAnswer);
      }
    }
  };

  private handleSpaceButton(e: KeyboardEvent): void {
    const activeWord = this.words[this.activeWordIndex];

    if (e.code === KeyCode.BUTTON_SPACE) {
      this.startAudio(activeWord);
    }
  }

  private handleDigitsButtons(e: KeyboardEvent): void {
    const buttons = document.querySelectorAll('.button-word-audio-game') as NodeListOf<HTMLButtonElement>;

    if (!this.isAnswer && e.code === KeyCode.BUTTON_ONE) {
      this.handleButton(buttons[0]);
    }

    if (!this.isAnswer && e.code === KeyCode.BUTTON_TWO) {
      this.handleButton(buttons[1]);
    }

    if (!this.isAnswer && e.code === KeyCode.BUTTON_THREE) {
      this.handleButton(buttons[2]);
    }

    if (!this.isAnswer && e.code === KeyCode.BUTTON_FOUR) {
      this.handleButton(buttons[3]);
    }

    if (!this.isAnswer && e.code === KeyCode.BUTTON_FIVE) {
      this.handleButton(buttons[4]);
    }
  }

  private generateOptions(item: IWordsData): OptionsType[] {
    const optionsArr: OptionsType[] = [];
    optionsArr.push({
      id: item.id,
      word: item.wordTranslate,
    });

    while (optionsArr.length < 5) {
      const randomIndex = this.helpers.getRandomInt(0, this.words.length);
      const randomWord = this.words[randomIndex];
      const optionInArr = optionsArr.find((option) => option.id === randomWord.id);

      if (!optionInArr) {
        optionsArr.push({
          id: randomWord.id,
          word: randomWord.wordTranslate,
        });
      }
    }

    return this.helpers.shuffleArray(optionsArr);
  }

  private createButtonsWithAnswer(options: OptionsType[]): void {
    const mainWrapper = document.querySelector('.main-wrapper-audio-game-page') as HTMLElement;
    mainWrapper.innerHTML = '';
    mainWrapper.innerHTML = this.templateAudioGame.baseTemplate;
    const mainContainer = this.pageContainer.querySelector('.main-container-audio-game') as HTMLDivElement;
    const container = document.createElement('div') as HTMLDivElement;
    container.classList.add('button-wrapper-audio-game');
    options.forEach((item) => {
      const buttonWord = document.createElement('button') as HTMLButtonElement;
      buttonWord.classList.add('button-audio-game', 'button-word-audio-game');
      buttonWord.innerHTML = item.word as string;
      buttonWord.dataset.id = item.id;
      container.appendChild(buttonWord);
      mainContainer?.appendChild(container);
    });
    this.drawNextCard();
    this.setGameCardListener();
  }

  public drawAudioGameFromBookPage(): void {
    const main = document.querySelector('.main') as HTMLDivElement;
    main.innerHTML = '';
    this.resetGame();
    const currPage = Number(localStorage.getItem('currPage'));
    const currGroup = Number(localStorage.getItem('currGroup'));
    this.controller
      .getWords(currGroup, currPage)
      .then((data) => {
        this.draw();
        this.words = this.helpers.shuffleArray(data);
        this.activeWordIndex = 0;
        this.drawGameCard();
        document.removeEventListener('keydown', this.handleKeyboardEvent);
        document.addEventListener('keydown', this.handleKeyboardEvent);
      });
  }
}
