class Badge {
    constructor(id, name, description, number, image) {
        this.id = id
        this.name = name
        this.description = description
        this.number = number
        this.image = image
    }
    isCompleted() {
        throw new Error('Abstract badge')
    }
}

class TotalImagesBadge extends Badge {
    constructor(id, name, description, number, image) {
        super(id, name, description, number, image)
    }
    isCompleted(userTags) {
        let response = userTags && Object.keys(userTags).length >= this.number
        return response
    }
}

class TotalTagsBadge extends Badge {
    constructor(id, name, description, number, image) {
        super(id, name, description, number, image)
    }
    isCompleted(userTags) {
        let response = false
        if (userTags) {
            let totalTags = 0
            Object.keys(userTags).forEach(function(key) {
                totalTags += userTags[key].tags
            })
            response = totalTags >= this.number
        }
        return response
    }
}

class ConsecutiveDaysBadge extends Badge {
    constructor(id, name, description, number, image) {
        super(id, name, description, number, image)
    }
    isCompleted(userTags) {
        let response = false
        if (userTags) {
            let dateDict = {}
            let challenge = this
            let today = (new Date()).setHours(0,0,0,0)
            for (let d = today - challenge.number; d <= today; d = d + 1) {
                dateDict[d] = false
            }
            response = true
            Object.keys(userTags).forEach(function(key) {
                // TODO check if .when works here!!
                if (userTags[key].when && userTags[key].tags) {
                    let day = (new Date(userTags[key].when)).setHours(0,0,0,0)
                    if (day >= today - challenge.number && day <= today) {
                        dateDict[day] = true
                    }
                }
            })
            Object.keys(dateDict).forEach(function(day) {
                if (! dateDict[day]) response = false
            })
        }
        return response
    }
}

class TotalImagesAndTagsAndDaysBadge extends Badge {
    constructor(id, name, description, numberImages, numberTags, numberDays, image) {
        super(id, name, description, numberImages, image)
        this.numberTags = numberTags
        this.numberDays = numberDays
        this.imagesBadge = new TotalImagesBadge('', '', '', numberImages, '')
        this.tagsBadge = new TotalTagsBadge('', '', '', numberTags, '')
        this.daysBadge = new ConsecutiveDaysBadge('', '', '', numberDays, '')
    }
    isCompleted(userTags) {
        if (userTags) {
            return this.imagesBadge.isCompleted(userTags) && this.tagsBadge.isCompleted(userTags) && this.daysBadge.isCompleted(userTags)
        } else {
            return false
        }
    }
}

let Badges = [
    new TotalImagesBadge('10images', '10 images total', 'Tag 10 or more different images', 10, 'bronze_image'),
    new TotalImagesBadge('25images', '25 images total', 'Tag 25 or more different images', 25, 'silver_image'),
    new TotalImagesBadge('50images', '50 images total', 'Tag all of the 50 available images', 50, 'gold_image'),
    new TotalTagsBadge('50tags', '50 tags total', 'Write a total of 50 or more tags accross all images', 50, 'bronze_tag'),
    new TotalTagsBadge('100tags', '100 tags total', 'Write a total of 100 or more tags accross all images', 100, 'silver_tag'),
    new TotalTagsBadge('250tags', '250 tags total', 'Write a total of 250 or more tags accross all images', 250, 'gold_tag'),
    new ConsecutiveDaysBadge('3days', '3 consecutive days', 'Tag at least one image per day for 3 consecutive days', 3, 'bronze_calendar'),
    new ConsecutiveDaysBadge('5days', '5 consecutive days', 'Tag at least one image per day for 5 consecutive days', 5, 'silver_calendar'),
    new ConsecutiveDaysBadge('7days', '7 consecutive days', 'Tag at least one image per day for 7 consecutive days', 7, 'gold_calendar'),
    new TotalImagesAndTagsAndDaysBadge('bronze', 'Bronze overall progress', 'Obtain badges "10 images total", "50 tags total", and "3 consecutive days"', 10, 50, 3, 'bronze_medal'),
    new TotalImagesAndTagsAndDaysBadge('silver', 'Silver overall progress', 'Obtain badges "25 images total", "100 tags total", and "5 consecutive days"', 25, 100, 5, 'silver_medal'),
    new TotalImagesAndTagsAndDaysBadge('gold', 'Gold overall progress', 'Obtain badges "50 images total", "250 tags total", and "7 consecutive days"', 50, 250, 7, 'gold_medal')
]

export default Badges