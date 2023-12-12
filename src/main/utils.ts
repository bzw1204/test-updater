// 是否是开发环境
export const isDev = process.env.NODE_ENV === 'development'
// 是否是Mac
export const isMac = process.platform === 'darwin'
// 是否是Win
export const isWin = process.platform === 'win32'
// 是否是Linux
export const isLinux = process.platform === 'linux'
