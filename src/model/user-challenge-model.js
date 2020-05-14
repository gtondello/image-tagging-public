/**
 * Represents a challenge and the status of the user regarding its completion.
 */
export class UserChallenge {
    constructor (challenge) {
        this.challenge = challenge  // the information about the challenge (see challenges.js)
        this.completed = false      // if the user already completed this challenge
        this.claimed = false        // if the user already claimed the reward for this challenge
        this.when = null            // when the user completed this challenge
    }
}
  