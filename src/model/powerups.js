class PowerUpUse {
    constructor(powerup) {
        this.powerup = powerup
        this.times = powerup.times
        this.multiplier = powerup.multiplier
    }
    applyTo(points) {
        if (this.times > 0) {
            this.times -= 1
            return points * this.multiplier
        } else {
            return points
        }
    }
}

class PowerUp {
    constructor(id, name, description, icon, times, multiplier) {
        this.id = id
        this.name = name
        this.description = description
        this.icon = icon
        this.times = times
        this.multiplier = multiplier
    }
    use() {
        return new PowerUpUse(this)
    }
}

let PowerUps = [
    new PowerUp("5x2", "5 x2", "Doubles the amount of points earned for the next 5 images tagged", "filter_2", 5, 2),
    new PowerUp("5x3", "5 x3", "Triples the amount of points earned for the next 5 images tagged", "filter_3", 5, 3),
    new PowerUp("10x2", "10 x2", "Doubles the amount of points earned for the next 10 images tagged", "filter_2", 10, 2),
    new PowerUp("10x3", "10 x3", "Triples the amount of points earned for the next 10 images tagged", "filter_3", 10, 3),
]

function getRandomPowerUp() {
    if (Math.random() >= 0.7) {  // 30% chance or receiving a power up
        return PowerUps[Math.floor(Math.random() * 4)] // returns a random power up from the 4 possible choices
    } else {
        return null
    }
}

export default PowerUps
export { getRandomPowerUp }