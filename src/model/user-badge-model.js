/**
 * Represents a badge and the status of the user regarding its acquisition.
 */
export class UserBadge {
    constructor (badge) {
        this.badge = badge       // the information about the badge (see badge.js)
        this.acquired = false    // if the user already acquired this badge
        this.when = null         // when the user acquired this badge
    }
}
