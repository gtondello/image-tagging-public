/**
 * Polyfill for Array.indexOf (for IE 7-8).
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
 */
if (!Array.prototype.indexOf) Array.prototype.indexOf = (function(Object, max, min){
  "use strict"
  return function indexOf(member, fromIndex) {
    if(this===null||this===undefined)throw TypeError("Array.prototype.indexOf called on null or undefined")
    
    var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
    if (i < 0) i = max(0, Len+i); else if (i >= Len) return -1
    
    if(member===void 0){ for(; i !== Len; ++i) if(that[i]===void 0 && i in that) return i // undefined
    }else if(member !== member){   for(; i !== Len; ++i) if(that[i] !== that[i]) return i // NaN
    }else                           for(; i !== Len; ++i) if(that[i] === member) return i // all else

    return -1 // if the value was not found, then return -1
  };
})(Object, Math.max, Math.min)

let Util = {
  /**
   * Shuffles array in place. ES6 version.
   * References:
   *   https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
   *   https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
   * @param {Array} a items An array containing the items.
   */
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  },

  generateCode(length) {
    if (length == null || length <= 0) return ''
    const chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','U','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  },

  arrayToObject(a) {
    if (a == null || a.length == 0) return null
    let obj = {}
    for (let i = 0; i < a.length; i++) {
      obj[i+1] = a[i]
    }
    return obj
  },

  arrayToMap(a) {
    if (a == null || a.length == 0) return null
    let obj = {}
    for (let i = 0; i < a.length; i++) {
      obj[a[i]] = true
    }
    return obj
  },

  mapToArray(obj) {
    if (obj == null) return []
    let a = []
    Object.keys(obj).forEach(function(key) {
      a.push(key)
    })
    return a
  },

  mapObject(obj) {
    if (obj == null) return {}
    let newObj = {}
    Object.keys(obj).forEach(function(key) {
      newObj[key] = obj[key]
    })
    return newObj
  }
}

export default Util