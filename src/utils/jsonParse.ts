export const jsonParse = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

export const jsonParseLog = <T>(msg: string, obj: T) => {
  console.log(`${msg}: `, JSON.parse(JSON.stringify(obj)))
}
