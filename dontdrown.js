const LOADING_TEXT_DIV = 5;
const SCROLL_DIV = 20;
const EXTENSION_TIME_MULT = 3; // the number of jumps for which the extension lasts
const REPERCUSSION_TIME_MULT = 3; // the number of jumps for which the repercussion lasts

const FONT_PATH = "sf-grunge-sans.bold.ttf";
const BULLET_POINT = 149;

class DontDrown extends Sketcher {
  constructor(p) {
    this.p = p;

    this.gameState = PRE_STARTUP;
    this.arcadeMode = false;
    this.gameMenu;
    this.musicPlayer;
    this.playingMusic = true;
    this.levelState;
    this.pc;
    this.risingWave;
    this.staticWave;
    this.debugOverlay;
    this.scoreOverlay;
    this.levels;
    this.currentLevel;
    this.collisionDetector;
    this.levelStartTimeMillis;
    this.extensionFrames; // the number of frames per extensions
    this.repercussionFrames; // the number of frames per repercussion
    this.repercussionMult; // the wave speed multiplier for repercussions
    this.endOfExtension = -1; // a value of frameCount
    this.endOfRepercussion = -1; // a value of frameCount
    this.extensionUsed = false;

    this.debugging = false; // toggles debug overlay and cheat commands
    this.staticStress = false; // prevents stress-based calculations; used for debugging

    this.scrollIncr; // the rate at which menus scroll
  }

  colorModeHSB() {
    this.p.colorMode(this.p.HSB, 360, 1, 1, 1);
  }

  colorModeRGB() {
    this.p.colorMode(this.p.RGB, 255, 255, 255, 255);
  }

  settings() {
    RSW_DEF = this.p.width / RSW_DEF_DIV;
    this.scrollIncr = this.p.height / SCROLL_DIV;
  }

  generateLevels() {
    this.levels = new Array(Debuff.values().length);
    for (let debuffIndex = 0; i < Debuff.values().length; i++) {
      this.levels[debuffIndex] = new Array(Difficulty.values().length);

      for (
        let diffIndex = 0;
        diffIndex < Difficulty.values().length;
        diffIndex++
      ) {
        this.levels[debuffIndex][diffIndex] = new Level(
          this,
          Debuff.values()[debuffIndex],
          Difficulty.values()[diffIndex]
        );
      }
    }
    this.gameMenu.updateLevelSelector();
  }

  startLevel(levelToStart) {
    if (levelToStart == null) {
      // arcade mode/debugging levels
      this.currentLevel = new Level(this, Debuff.random(), Difficulty.random());
    } else {
      this.currentLevel = levelToStart;
    }

    // reset values
    this.extensionUsed = false;
    this.endOfExtension = -1;
    this.endOfRepercussion = -1;
    this.levelState.reset(level);
    this.collisionDetector.sortLists();
    this.risingWave.pos.y = Wave.waveInitHeight;
    const ground = this.currentLevel.platforms.get(0);
    this.pc.reset(
      ground.pos.x + ground.width / 2,
      ground.pos.y - PlayerCharacter.diameter
    );
    this.collisionDetector.pcOldPos = pc.pos.copy();
    this.gameState = MID_LEVEL;
    this.gameMenu.midLevel = true;
    this.levelStartTimeMillis = Date.now();
  }

  endLevel(completed) {
    if (this.arcadeMode) {
      // endless levels in arcade mode
      if (completed) {
        this.startLevel(null);
      } else {
        this.startLevel(this.currentLevel);
      }
    } else {
      if (completed) {
        this.gameState = IN_MENU;
        this.gameMenu.setMenuState(GameMenu.MenuState.LEVEL_SELECTION);
        this.gameMenu.midLevel = false;
        const secondsLeft =
          this.currentLevel.waveTime * (60 / this.p.frameRate) -
          (Date.now() - this.levelStartTimeMillis) / 1000;

        if (
          this.currentLevel.highScore < this.levelState.tokensCollected ||
          (this.currentLevel.highScore == this.levelState.tokensCollected &&
            secondsLeft > this.currentLevel.timeLeft)
        ) {
          // update level's highscore and best time if appropriate
          this.currentLevel.highScore = this.levelState.tokensCollected;
          this.currentLevel.timeLeft = secondsLeft;
          this.gameMenu.updateLevelSelector();
        }

        this.levelState.reset();
      } else {
        // restart level upon death
        this.startLevel(this.currentLevel);
      }
    }
  }

  draw() {
    switch (this.gameState) {
      case PRE_STARTUP:
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
        this.p.textSize(this.p.height / LOADING_TEXT_DIV);
        this.p.fill(0xff000000);
        this.p.text("Loading...", this.p.width / 2, this.p.height / 2);

        this.gameState = STARTUP;
        break;
      case STARTUP:
        this.p.noStroke();
        this.musicPlayer = new MusicPlayer(this);
        this.levelState = new StressAndTokenState(this);
        this.pc = new PlayerCharacter(this);
        this.extensionFrames = this.pc.jumpFrames * EXTENSION_TIME_MULT;
        this.repercussionFrames = this.pc.jumpFrames * REPERCUSSION_TIME_MULT;
        this.repercussionMult =
          1 + this.extensionFrames / this.repercussionFrames;
        this.risingWave = new Wave(this);
        this.staticWave = new Wave(this);
        this.levelState.pcCalcs();
        this.debugOverlay = new DebugOverlay(this);
        this.scoreOverlay = new ScoreOverlay(this);
        this.collisionDetector = new CollisionDetector(this);
        this.gameMenu = new GameMenu(this);
        this.generateLevels();

        this.levelState.stress = 0;
        this.levelState.sketchiness();
        this.gameState = GameState.IN_MENU;
        break;
      case IN_MENU:
        this.p.cursor();
        if (this.playingMusic) this.musicPlayer.playMusic();

        this.gameMenu.render();

        if (this.debugging) this.debugOverlay.render();
        break;
      case MID_LEVEL:
        this.p.noCursor();
        if (this.playingMusic) this.musicPlayer.playMusic();

        // update positions
        this.levelState.update();
        this.pc.integrate();
        this.level.integrate();
        this.integrateWave();

        // check if panning needed
        if (
          this.pc.pos.y <
          this.scoreOverlay.endOfPadding + 2 * this.pc.jumpHeight
        ) {
          this.level.panningState = Level.PanningState.UP;
        } else if (
          this.pc.pos.y >
          this.p.height - (this.scoreOverlay.endOfPadding + this.pc.jumpHeight)
        ) {
          this.level.panningState = Level.PanningState.DOWN;
        } else {
          this.level.panningState = Level.PanningState.NEITHER;
        }

        // detect collisions
        this.collisionDetector.detectCollisions();

        // draw
        this.level.render();
        this.pc.render();
        this.risingWave.render();

        if (this.levelState.debuff.equals(Debuff.TUNNEL_VISION)) {
          this.p.fill(0xff000000);
          this.p.rect(
            0,
            0,
            this.p.width,
            this.pc.pos.y - this.pc.jumpHeight * 1.2
          );
          this.p.rect(
            0,
            this.pc.pos.y + this.pc.jumpHeight,
            this.p.width,
            this.p.height
          );
        }

        this.scoreOverlay.render();
        if (this.debugging) this.debugOverlay.render();
        break;
    }
  }

  integrateWave() {
    if (this.p.frameCount <= this.endOfExtension) {
      // don't change the wave
    } else if (this.p.frameCount <= this.endOfRepercussion) {
      this.risingWave.pos.y -=
        this.currentLevel.waveRiseRate * this.repercussionMult;
    } else {
      this.risingWave.pos.y -= this.currentlevel.waveRiseRate;
    }
  }

  /* TODO transpile IO  
  
  @Override
    public void keyPressed() {
        if (key == 'D') {
            debugging = !debugging;
            return;
        } else if (key == ESC) {
            key = 'p';
        }

        switch (gameState) {
            case PRE_STARTUP:
            case STARTUP:
                // ignore inputs
                break;
            case IN_MENU:
                // unpause
                if (gameMenu.midLevel && (key == 'p' || key == 'P')) {
                    gameState = DontDrown.GameState.MID_LEVEL;
                }
                break;
            case MID_LEVEL:
                if (key == CODED) {
                    switch (keyCode) {
                        case LEFT:
                            pc.steer(PlayerCharacter.SteerState.LEFT);
                            break;
                        case RIGHT:
                            pc.steer(PlayerCharacter.SteerState.RIGHT);
                            break;
                        case UP:
                            pc.jump();
                            break;
                        case DOWN:
                            pc.drop();
                            break;
                        default:
                            // do nothing
                    }
                } else if (key == 'p' || key == 'P') {
                    gameMenu.midLevel = true;
                    gameMenu.setMenuState(GameMenu.MenuState.PAUSE_MENU);
                    gameState = GameState.IN_MENU;
                } else if (key == ' ' && !extensionUsed) {
                    endOfExtension = frameCount + extensionFrames;
                    endOfRepercussion = endOfExtension + repercussionFrames;
                    extensionUsed = false;
                } else if (debugging) {
                    switch (key) {
                        case '`':
                            levelState.stress = 100;
                            break;
                        case 'f':
                        case 'F':
                            if (frameRate > 40) {
                                frameRate(30);
                            } else if (frameRate > 20) {
                                frameRate(10);
                            } else {
                                frameRate(60);
                            }
                            break;
                        case ',':
                            level.panningState = Level.PanningState.DOWN;
                            break;
                        case '.':
                            level.panningState = Level.PanningState.NEITHER;
                            break;
                        case '/':
                            level.panningState = Level.PanningState.UP;
                            break;
                        case '+':
                            levelState.stress++;
                            break;
                        case '-':
                            levelState.stress--;
                            break;
                        case 'w':
                        case 'W':
                            if (level.waveRiseRate == level.defaultWaveRiseRate) {
                                level.waveRiseRate = 0;
                            } else {
                                level.waveRiseRate = level.defaultWaveRiseRate;
                            }
                            break;
                        case 's':
                        case 'S':
                            staticStress = !staticStress;
                            break;
                        default:
                            if (Character.isDigit(key)) {
                                levelState.stress = Integer.parseInt("" + key) * 10f;
                            } else {
                                // do nothing
                            }
                    }
                }
                break;
        }
    }

    @Override
    public void keyReleased() {
        if (key == CODED) {
            switch (keyCode) {
                case LEFT:
                    if (pc.getSteerState().equals(PlayerCharacter.SteerState.LEFT)) {
                        pc.steer(PlayerCharacter.SteerState.NEITHER);
                    }
                    break;
                case RIGHT:
                    if (pc.getSteerState().equals(PlayerCharacter.SteerState.RIGHT)) {
                        pc.steer(PlayerCharacter.SteerState.NEITHER);
                    }
                    break;
                default:
                    // do nothing
            }
        }
    }

    @Override
    public void mouseClicked() {
        if (gameState.equals(GameState.IN_MENU)) {
            gameMenu.resolveClick();
        }
    }

    @Override
    public void mouseWheel(MouseEvent event) {
        if (gameState.equals(GameState.IN_MENU)) {
            gameMenu.scrollWrapper(-event.getCount() * scrollIncr);
        }
    }
  */
}
