'use client'

import {ClientSideSuspense, LiveblocksProvider} from "@liveblocks/react/suspense";
import {ReactNode} from "react";
import Loader from "@/components/Loader";
import {getClerkUsers} from "@/lib/actions/user.actions";

export default function Provider({children}: {children: ReactNode}) {
    return (
        <LiveblocksProvider
            authEndpoint='/api/liveblocks-auth'
            resolveUsers={async ({userIds}) => {
                return await getClerkUsers({userIds})
            }}
        >
            <ClientSideSuspense fallback={<Loader/>}>
                {children}
            </ClientSideSuspense>
        </LiveblocksProvider>
    )
}