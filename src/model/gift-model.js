/**
 * Represents a gift send by a user.
 */
export class Gift {
  constructor () {
    this.id = ''            // The auto-generated gift ID
    this.code = ''          // The gift's sender/receiver unique code
    this.name = ''          // The gift's sender/receiver display name
    this.avatar = ''        // The gift's sender/receiver avatar
    this.badge = ''         // The gift's sender/receiver display badge
    this.totalPoints = 0    // The total amount of points that the gift's sender/receiver has earned
    this.level = 1          // The current level of the gift's sender/receiver
    this.timestamp = 0      // The date/time the gift was sent
    this.value = 0          // The amount of points sent as gift
    this.received = false   // If the gift has been received already
  }
}
  