
import { Game } from './game';
import {
  showScreen, initLoginScreen, initTutorialScreen,
  drawWaveHUD, checkOrientation
} from './ui';
import { PlayerData } from './definitions';

let game: Game | null = null;

async function main(): Promise<void> {
  // Check orientation
  checkOrientation();

  // Show login screen first
  showScreen('login-screen');

  // Init login
  initLoginScreen((playerData: PlayerData) => {
    showScreen('tutorial-screen');
    initTutorialScreen(() => {
      startGame(playerData);
    });
  });
}

function startGame(playerData: PlayerData): void {
  // Destroy existing game if any
  if (game) {
    game.destroy();
    game = null;
  }

  showScreen('game-hud');

  game = new Game();
  game.init(playerData);

  // Start wave HUD animation
  drawWaveHUD();
}

main();
