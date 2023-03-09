// debug nested objects console.log('message', clone(obj))

export const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))
