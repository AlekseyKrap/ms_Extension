export type Message<T=unknown>= {
    "action":string,
    payload?:T
    address?:string
}

export type GPData =
    {uid?: string ,
    options?: Record<string, string>
    version?: string
    }

export type GPEventData =
    {
        event: string ,
        value: string |Record<string, string>
    }
