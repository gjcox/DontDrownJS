function getFontSizeFromID(id) {
    const el = document.getElementById(id);
    const fontSize = parseInt(window.getComputedStyle(el).fontSize);
    return fontSize;
}

export { getFontSizeFromID }; 