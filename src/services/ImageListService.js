import IMAGE_LIST from '@/assets/images/image-list.json'

let ImageListService = {
    /**
     * Returns the length of the image list.
     */
    length() {
        return IMAGE_LIST.length
    },

    /**
     * Returns a new array with only the images that were not tagged by the logged user yet
     */
    getAvailableImages(taggedImages) {
        return IMAGE_LIST.filter((image) => {
            return !taggedImages[image.fileName]
        })
    },

    /**
     * Returns an array with 10 random tags from either the specified image or from another random image
     */
    getRandomTagsForImage(image) {
        if (image == null) return []
        let imageTags = image.tags.split(';')
        let otherTags = null
        while (otherTags === null) {
            let randomNumber = Math.floor(Math.random() * IMAGE_LIST.length)
            if (IMAGE_LIST[randomNumber].fileName != image.fileName) {
                otherTags = IMAGE_LIST[randomNumber].tags.split(';')
            }
        }
        let allTags = imageTags.concat(otherTags)
        let randomTags = []
        while (randomTags.length < 10 && allTags.length > 0) {
            let randomNumber = Math.floor(Math.random() * allTags.length)
            if (randomTags.indexOf(allTags[randomNumber]) == -1) {
                randomTags = randomTags.concat(allTags.splice(randomNumber, 1))
            }
        }
        return randomTags
    }
}

export default ImageListService