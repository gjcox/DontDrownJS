const STRESS_LIMITS = { min: 0, max: 100, changeRate: 0.75 };
Object.freeze(STRESS_LIMITS);

export default class StressTracker {
    /**
     * 
     * @param {*} setStressIndex a function to set the stress index (int 0-100) for sprite rendering. 
     */
    constructor(setStressIndex, stressfulWaveDistance) {
        this.setStressIndex = setStressIndex;
        this._stressfulWaveDistance = stressfulWaveDistance;
    }

    reset() {
        this._stress = 0;
        this._stressRating = 0;
        // Stress does not impact gameplay when below the threshold 
        this._stressEffectThreshold = STRESS_LIMITS.max / 5;
        this._stressRange = STRESS_LIMITS.max - this._stressEffectThreshold;
        this.setStressIndex(this._stress);
    }

    updateStress(waveDistance) {
        // const waveDistance = Math.abs(sketch.risingWave.pos.y - sketch.pc.pos.y);
        const stressDistance = this._stressfulWaveDistance;

        // Stress increases/decreases based on how far the wave is from the PC 
        const stressChange = waveDistance <= stressDistance ?
            (stressDistance - waveDistance) / stressDistance :
            -Math.min(1, (waveDistance - stressDistance) / stressDistance);
        this._stress += stressChange * STRESS_LIMITS.changeRate;

        // Keep stress within bounds 
        this._stress = Math.max(STRESS_LIMITS.min, this._stress);
        this._stress = Math.min(STRESS_LIMITS.max, this._stress);

        this.setStressIndex(this._stress);
    }
}