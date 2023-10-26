/* Sprites for most platforms */
const _platformSprites = [];
const platformSprites = (p, sketcher) => {
  if (_platformSprites.length == 0) {
    generatePlatformSprites(p, sketcher, _platformSprites);
  }
  return _platformSprites;
};

/* Easy levels have an extra-wide ground platform */
const _widePlatformSprites = [];

/* Sprites for the top platform of levels are a unique colour */
const _topPlatformSprites = [];
const topPlatformSprites = (p, sketcher) => {
  if (_topPlatformSprites.length == 0) {
    generateTopPlatformSprites(p, sketcher, _topPlatformSprites);
  }
  return _topPlatformSprites;
};

class Platform extends AbstractDrawable {
  constructor(p, sketcher, x, y) {
    super(p, /*sketcher,*/ platformSprites(p, sketcher));
    this.initPos = p.createVector(x, y);
    this.pos = this.initPos.copy();
    this.width = p.width / PF_WIDTH_DIV;
    this.height = p.width / PF_WIDTH_DIV / PF_HEIGHT_DIV;
  }

  colourAsTop() {
    this.sprites = topPlatformSprites(p);
  }
  
  makeWide(newWidth) {
    throw new Error("TODO: implement wide platforms")
  }

  onScreen() {
    return this.pos.y <= 
      this.p.height && 
      this.pos.y >= 
      this.height;
  }

  render() {
   //this.currSprite.draw(this.pos);
    this.renderDrawable();
  }
}
