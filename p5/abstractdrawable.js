// current stress rounded to an integer 
// TODO: point this to actual stress value  
// var drawablesStressIndex = () => Math.round(stress);
var drawablesStressIndex = () => 0; 

/**
 * Handles the rendering of objects based on current stress.
 *
 * N.B. Implementing subclasses must have a method of token generation.
 * Token generation should use a static method, hence not being an abstract to inherit.
 */
class AbstractDrawable {
  constructor(p, /*game,*/ sprites) {
    // this.game = game;
    // this.state = game.levelState;
    this.p = p;  
    this.redrawOffset = Math.round(Math.random() * FRAMES_PER_RESKETCH_MIN);

    this.pos = undefined; // position

    this.sprites = sprites;
    this.spriteIndex = 0;
    this.currSprite = this.sprites[drawablesStressIndex()][this.spriteIndex];

    this.lastStressIndex = 0;
  }

  onScreen() {
    throw new Error("Child of AbstractDrawable must implement onScreen().");
  }

  /**
   * (Redraws and) draws an object as dictated by stress.
   */
  renderDrawable() {
    if (this.onScreen()) {
      if (
        this.currSprite == null ||
        0 ==
          (this.p.frameCount + this.redrawOffset) % 10/*this.state.framesPerResketch*/
      ) {
        this.spriteIndex = (this.spriteIndex + 1) % N_SPRITE_VARIANTS;
        this.currSprite = this.sprites[drawablesStressIndex()][this.spriteIndex];
        this.lastStressIndex = drawablesStressIndex();
      } else if (Math.abs(/*this.state.stress*/0 - this.lastStressIndex) > 5) {
        this.currSprite = this.sprites[drawablesStressIndex()][this.spriteIndex];
        this.lastStressIndex = drawablesStressIndex();
      }

      this.currSprite.draw(this.pos);
    }
  }

  // TODO move this into stress bar class

  /**
   * Intended for the stress bar's fill, which redraws itself more frequently so that the bar fills smoothly.
   */
  /* protected void renderADStress() {
        if (onScreen()) {
            if (token == null
                    || (sketch.frameCount + redrawOffset) % FRAMES_PER_STRESS_BAR_RESKETCH == 0) {
                tokenIndex = (tokenIndex + 1) % VARIANT_TOKENS;
                int stressIndexAlt = (int) Math.max(0, (state.stress * ScoreOverlay.StressBar.STRESS_BAR_RESOLUTION));
                token = tokens[stressIndexAlt][tokenIndex];
            }

            sketch.shape(token, pos.x, pos.y);
        }
    }*/

  /**
   * Usually a wrapper for either renderAD() or renderADStress().
   */
  /* public abstract void render(); */
}
