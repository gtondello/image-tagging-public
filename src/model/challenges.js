class Challenge {
    constructor(id, name, description, number, value) {
        this.id = id
        this.name = name
        this.description = description
        this.number = number
        this.value = value
    }
    isCompleted() {
        throw new Error('Abstract challenge')
    }
}

class NumberOfTagsChallenge extends Challenge {
    constructor(id, name, description, number, value) {
        super(id, name, description, number, value)
    }
    isCompleted(userTags) {
        let response = false
        let challenge = this
        if (userTags) {
            Object.keys(userTags).forEach(function(key) {
                if (userTags[key].tags >= challenge.number) {
                    response = true
                }
            })
        }
        return response
    }
}

class ImagesPerDayChallenge extends Challenge {
    constructor(id, name, description, number, value) {
        super(id, name, description, number, value)
    }
    isCompleted(userTags) {
        let response = false
        if (userTags) {
            let dateDict = {}
            let challenge = this
            Object.keys(userTags).forEach(function(key) {
                // TODO check if .when works here!!
                if (userTags[key].when && userTags[key].tags) {
                    let day = (new Date(userTags[key].when)).setHours(0,0,0,0)
                    dateDict[day] = (dateDict[day] ? dateDict[day] : 0) + 1
                    if (dateDict[day] >= challenge.number) {
                        response = true
                    }
                }
            })
        }
        return response
    }
}

class ConsecutiveDaysChallenge extends Challenge {
    constructor(id, name, description, number, value) {
        super(id, name, description, number, value)
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

class TotalImagesChallenge extends Challenge {
    constructor(id, name, description, number, value) {
        super(id, name, description, number, value)
    }
    isCompleted(userTags) {
        let response = userTags && Object.keys(userTags).length >= this.number
        return response
    }
}

class TotalTagsChallenge extends Challenge {
    constructor(id, name, description, number, value) {
        super(id, name, description, number, value)
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

let Challenges = [
    new NumberOfTagsChallenge('5tags', '5 tags for an image', 'Write 5 or more tags for a single image', 5, 10),
    new NumberOfTagsChallenge('10tags', '10 tags for an image', 'Write 10 or more tags for a single image', 10, 25),
    new NumberOfTagsChallenge('20tags', '20 tags for an image', 'Write 20 or more tags for a single image', 20, 50),
    new ImagesPerDayChallenge('5day', '5 images in a day', 'Tag 5 or more different images in a single day', 5, 25),
    new ImagesPerDayChallenge('10day', '10 images in a day', 'Tag 10 or more different images in a single day', 10, 50),
    new ConsecutiveDaysChallenge('3days', '3 consecutive days', 'Tag at least one image per day for 3 consecutive days', 3, 10),
    new ConsecutiveDaysChallenge('5days', '5 consecutive days', 'Tag at least one image per day for 5 consecutive days', 5, 25),
    new ConsecutiveDaysChallenge('7days', '7 consecutive days', 'Tag at least one image per day for 7 consecutive days', 7, 50),
    new TotalImagesChallenge('10images', '10 images total', 'Tag 10 or more different images', 10, 25),
    new TotalImagesChallenge('25images', '25 images total', 'Tag 25 or more different images', 25, 50),
    new TotalImagesChallenge('50images', '50 images total', 'Tag all of the 50 available images', 50, 100),
    new TotalTagsChallenge('50tags', '50 tags total', 'Write a total of 50 or more tags accross all images', 50, 25),
    new TotalTagsChallenge('100tags', '100 tags total', 'Write a total of 100 or more tags accross all images', 100, 50),
    new TotalTagsChallenge('250tags', '250 tags total', 'Write a total of 250 or more tags accross all images', 250, 100)
]

export default Challenges