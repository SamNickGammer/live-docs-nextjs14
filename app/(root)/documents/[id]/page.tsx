import CollaborativeRoom from "@/components/CollaborativeRoom";
import {currentUser} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import {getDocument} from "@/lib/actions/room.actions";

export default async function Document({params: {id}}: SearchParamProps) {
    const clerkUser = await currentUser()
    if(!clerkUser) redirect('/sign-in');

    const room = await getDocument({
        roomId: id,
        userId: clerkUser.emailAddresses[0].emailAddress
    })

    if(!room) redirect('/')

    //TODO: Assess the permission of the user to access the document

    return (
        <main className='flex w-full flex-col items-center'>
            <CollaborativeRoom
                roomId={id}
                roomMetadata={room.metadata}
            />
        </main>
    )
}