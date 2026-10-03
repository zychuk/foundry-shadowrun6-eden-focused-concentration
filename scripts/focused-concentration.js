/**
 * SR6 Eden: Focused Concentration (SR6 Core, p. 71)
 *
 * Quality, levels 1 to 3. For each level, the character can sustain one additional spell or
 * complex form without the sustaining penalty (-2 dice pool per sustained spell/complex form).
 * A spell with a modified Drain Value of 7 or more doesn't qualify.
 *
 * Target with an Active Effect:  key system.focusedConcentration, mode Add, value = level.
 *
 * Nothing in the system files is changed: the module wraps the system's sustained-modifier
 * calculation at runtime, so it survives system updates.
 */

const SYSTEM_ID = "shadowrun6-eden";
const LOG = "SR6 Focused Concentration |";
const PENALTY_PER_SUSTAINED = 2;   // SR6 Core: -2 dice pool per sustained spell or complex form
const MAX_DRAIN = 7;               // Spells with a Drain Value of 7 or more can't be sustained for free

/** Focused Concentration level of an actor (0 when not set) */
function getLevel(actor) {
    return Math.max(0, Math.trunc(Number(actor?.system?.focusedConcentration) || 0));
}

/**
 * Number of the actor's currently sustained spells/complex forms that Focused Concentration
 * may cover. Uses the same selection as the system: spells and complex forms with a
 * "sustained" duration that are toggled to sustaining.
 */
function countEligibleSustained(actor) {
    let eligible = 0;
    for (const item of actor.items ?? []) {
        if (item.type !== "spell" && item.type !== "complexform") continue;
        const data = item.system ?? {};
        if (data.duration !== "sustained" || !data.isSustained) continue;
        if (item.type === "spell") {
            // The system stores the spell's base Drain Value; amps added when casting aren't recorded
            const drain = Number(data.drain);
            if (Number.isFinite(drain) && drain >= MAX_DRAIN) continue;
        }
        eligible++;
    }
    return eligible;
}

function patchActor() {
    const proto = CONFIG.Actor.documentClass?.prototype;
    const original = proto?.getSustainedModifier;
    if (typeof original !== "function") {
        console.warn(`${LOG} getSustainedModifier not found, the sustaining penalty is not reduced.`);
        return;
    }
    // If the system ever supports Focused Concentration natively, step aside
    if (original.toString().includes("focusedConcentration")) {
        console.warn(`${LOG} The system already handles focusedConcentration, the module's patch is not needed.`);
        return;
    }

    proto.getSustainedModifier = function (...args) {
        const modifier = original.apply(this, args);
        const level = getLevel(this);
        if (!level || !modifier) return modifier;

        const free = Math.min(level, countEligibleSustained(this));
        return Math.max(0, modifier - free * PENALTY_PER_SUSTAINED);
    };

    // Reset the value every data preparation so "Add" effects never stack up over time
    const originalBase = proto.prepareBaseData;
    proto.prepareBaseData = function (...args) {
        const result = originalBase?.apply(this, args);
        if (this.system && typeof this.system === "object") this.system.focusedConcentration = 0;
        return result;
    };

    console.log(`${LOG} Sustained modifier patch active.`);
}

Hooks.once("setup", () => {
    if (game.system.id !== SYSTEM_ID) return;
    patchActor();

    // Registered here (after the system's init) so it runs after the system rebuilds CONFIG.SR6 on ready
    Hooks.once("ready", () => {
        const options = CONFIG.SR6?.ACTIVE_EFFECT_OPTIONS;
        if (options) options.system_focusedConcentration = game.i18n.localize("SR6FOCCON.EffectOption");
    });
});
