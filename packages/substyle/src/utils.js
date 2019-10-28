export const keys = obj => {
  return obj === Object(obj) ? Object.keys(obj) : []
}

export const values = obj => {
  //Update - 29th Oct 2019
  //Removed by Robins Gupta..Electron browser and old browser
  //return obj === Object(obj) ? Object.values(obj) : []
  if(obj === Object(obj)){
    const vals = Object.keys(obj).map(function (key) {
      return obj[key];
    });
    return vals;
  }else{
    return []
  }
}

function mergeDeep(target, source) {
  let output = assign({}, target)
  if (isPlainObject(target) && isPlainObject(source)) {
    keys(source).forEach(key => {
      if (isPlainObject(source[key])) {
        if (!(key in target)) assign(output, { [key]: source[key] })
        else output[key] = mergeDeep(target[key], source[key])
      } else {
        assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

export const merge = (target, ...sources) => {
  return sources.reduce((t, s) => {
    return mergeDeep(t, s)
  }, target)
}

export const assign = (target, ...sources) => {
  return Object.assign(target, ...sources)
}

export const identity = value => {
  return value
}

export const omit = (obj, keys: string[]) => {
  const other = Object.assign({}, obj)
  if (keys) {
    for (let i = 0; i < keys.length; i++) {
      delete other[keys[i]]
    }
  }
  return other
}

export const isPlainObject = obj =>
  obj === Object(obj) && !(obj instanceof Date) && !Array.isArray(obj)

export const compact = arr => {
  return (arr || []).filter(Boolean)
}
