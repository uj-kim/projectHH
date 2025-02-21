export const randomId = (): string => {
    return Array.from(crypto.getRandomValues(new Uint32Array(2)))
        .map((word) => word.toString(16).padStart(8, "0"))
        .join("")
  }