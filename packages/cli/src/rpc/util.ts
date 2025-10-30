import { INTERNAL_ERROR, type RpcError } from './types.js'

export const isValidId = (nodeId: string) => {
  return /[^a-z0-9\s]+/.test(nodeId) || nodeId.length !== 64 ? false : true
}

export function callWithStackTrace(handler: Function, debug: boolean) {
  return async (...args: any) => {
    try {
      const res = await handler(...args)
      return res
    } catch (error: any) {
      const e: RpcError = {
        code: error.code ?? INTERNAL_ERROR,
        message: error.message,
      }
      if (debug === true) {
        e['trace'] = error.stack ?? 'Stack trace is not available'
      }

      throw e
    }
  }
}

/**
 * Converts a BitArray response to a boolean array indicating which content keys were accepted
 * @param res The response from sendOffer (can be BitArray, undefined, or empty array)
 * @param contentKeysLength The number of content keys that were offered
 * @returns Object with success array, declined flag, or failed flag
 */
export function bitToBooleanArray(res: any, contentKeysLength: number): { success?: boolean[]; declined?: boolean; failed?: boolean } {
  if (res === undefined) {
    return { declined: true }
  }

  if (Array.isArray(res) && res.length === 0) {
    return { declined: true }
  }

  // If res is a BitArray, convert it to boolean array
  if (res !== undefined && res !== null && typeof res === 'object' && 'getTrueBitIndexes' in res) {
    const acceptedBits = (res as any).getTrueBitIndexes()
    const successArray = new Array(contentKeysLength).fill(false)
    acceptedBits.forEach((index: number) => {
      if (index < contentKeysLength) {
        successArray[index] = true
      }
    })
    return { success: successArray }
  }

  return { success: new Array(contentKeysLength).fill(true) }
}