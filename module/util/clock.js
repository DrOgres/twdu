

async function increaseClock(amount) {
    // increase completion of clocks on a sheet
    console.log("TWDU | increaseClock: ", amount);
}

async function decreaseClock(amount) {
    // decrease completion of clocks on a sheet
    console.log("TWDU | decreaseClock: ", amount);
}

export default class Clock {
    constructor(segments) {
        this._value = 0;
        this._segments = segments;
        console.log("TWDU | Clock: ", segments);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}