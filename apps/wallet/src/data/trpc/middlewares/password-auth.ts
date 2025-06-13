import { initTRPC, TRPCError } from '@trpc/server'
import type { CreateWebExtContextOptions } from '@status-im/trpc-webext/adapter'

export interface PasswordAuthParams {
  password: string
  walletId: string
}

export function createPasswordAuthPlugin() {
  const t = initTRPC.context<CreateWebExtContextOptions>().meta<{}>().create({
    isServer: false,
    allowOutsideOfServer: true,
  })
  return t.procedure.use(async opts => {
    console.log('t.procedure.use', opts, arguments)
    const { ctx } = opts
    const { keyStore } = ctx
    const params = ctx.params as PasswordAuthParams
    if (typeof params?.password !== 'string') return opts.next()
    if (!params.walletId)
      throw new TRPCError({
        message: 'Missing walletId in params',
        code: 'BAD_REQUEST',
      })

    let validPassword: undefined | string

    await keyStore
      .export(params.walletId, params.password)
      .then(() => {
        validPassword = params.password
      })
      .catch(() => {})

    return opts.next({ ctx: { validPassword } })
  })
}
