/**
 * Represents a power up and the quantity that the user has of said powerup
 */
export class UserPowerUp {
    constructor (powerup, quantity) {
        this.powerup = powerup       // the information about the powerup (see powerups.js)
        this.quantity = quantity    // the quantity that the user has of said powerup
    }
}
